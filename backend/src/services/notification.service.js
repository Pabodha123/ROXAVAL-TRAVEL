const { Notification, User, Admin } = require('../models');
const logger = require('../config/logger');
const { sendEmail } = require('../utils/email');
const { notificationEmail } = require('../utils/emailTemplates');

/**
 * Central place for creating in-app notifications. Other services call
 * this instead of writing to the Notification model directly, so delivery
 * rules (e.g. future push/SMS fan-out) only need to change in one place.
 * Also fans each notification out to email — the single integration point
 * for the whole app's transactional email, so every existing call site
 * starts emailing without needing its own changes.
 */
const notify = async ({ recipient, type, title, message, link = '', relatedModel = '', relatedId = null, itinerary = null }) => {
  try {
    const notification = await Notification.create({ recipient, type, title, message, link, relatedModel, relatedId });

    const user = await User.findById(recipient).select('email fullName');
    if (user?.email) {
      await sendEmail({ to: user.email, subject: title, html: notificationEmail({ title, message, link, itinerary }) });
    }

    return notification;
  } catch (err) {
    logger.error(`Failed to create notification: ${err.message}`);
    return null;
  }
};

/**
 * Fans a notification out to every admin account (e.g. a new inquiry, which
 * isn't yet assigned to anyone). Reuses `notify()` per-recipient so each
 * admin gets both the in-app notification and the email.
 */
const notifyAllAdmins = async ({ type, title, message, link = '', relatedModel = '', relatedId = null }) => {
  const admins = await Admin.find().populate('user', '_id');
  await Promise.all(
    admins
      .filter((admin) => admin.user)
      .map((admin) => notify({ recipient: admin.user._id, type, title, message, link, relatedModel, relatedId }))
  );
};

module.exports = { notify, notifyAllAdmins };
