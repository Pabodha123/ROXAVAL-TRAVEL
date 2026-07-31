const { Customer, Notification, BirthdayConfig, BirthdayLog } = require('../models');
const { sendEmail } = require('../utils/email');
const { birthdayEmail } = require('../utils/emailTemplates');
const logger = require('../config/logger');

const DEFAULT_BACKGROUND = 'https://roxaval-travel-onju.vercel.app/birthday-card-bg.jpg';

const firstNameOf = (fullName = '') => fullName.trim().split(/\s+/)[0] || 'Traveller';

const applyTemplate = (template, firstName) => template.replace(/\{\{\s*firstName\s*\}\}/g, firstName);

const generateCouponCode = (firstName) => {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const namePart = firstName.replace(/[^a-zA-Z]/g, '').slice(0, 8).toUpperCase() || 'GUEST';
  return `BDAY-${namePart}-${suffix}`;
};

/**
 * All customers with a stored date of birth, with the `user` ref populated
 * (name/email) — the shared base query for both "today" and "upcoming".
 */
const customersWithBirthdays = () =>
  Customer.find({ dateOfBirth: { $ne: null } }).populate('user', 'fullName email');

// Days from "today" (UTC, midnight-normalized) to this customer's next
// birthday — 0 if it's today, otherwise 1..365/366 counting forward,
// wrapping to next year if this year's date has already passed.
const daysUntilNextBirthday = (dob, today) => {
  const next = new Date(Date.UTC(today.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate()));
  const todayMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (next < todayMidnight) next.setUTCFullYear(next.getUTCFullYear() + 1);
  return Math.round((next - todayMidnight) / 86400000);
};

const getTodayBirthdays = async () => {
  const today = new Date();
  const customers = await customersWithBirthdays();
  return customers.filter((c) => daysUntilNextBirthday(new Date(c.dateOfBirth), today) === 0);
};

const getUpcomingBirthdays = async (days = 30) => {
  const today = new Date();
  const customers = await customersWithBirthdays();
  return customers
    .map((c) => ({ customer: c, daysUntil: daysUntilNextBirthday(new Date(c.dateOfBirth), today) }))
    .filter(({ daysUntil }) => daysUntil > 0 && daysUntil <= days)
    .sort((a, b) => a.daysUntil - b.daysUntil);
};

/**
 * Sends (or re-sends) the birthday email + in-app notification for one
 * customer and upserts the BirthdayLog row for the current year. Never
 * throws — failures are recorded on the log itself so a bad address can't
 * take down a batch run, matching sendEmail()'s own swallow-and-log
 * contract.
 */
const sendBirthdayWish = async (customer, { method = 'auto' } = {}) => {
  const year = new Date().getUTCFullYear();
  const user = customer.user;
  if (!user?.email) {
    logger.error(`Birthday wish skipped: customer ${customer._id} has no linked user email`);
    return null;
  }

  const firstName = firstNameOf(user.fullName);
  const config = await BirthdayConfig.getSingleton();

  let coupon = null;
  let couponCode = '';
  if (config.couponEnabled) {
    couponCode = generateCouponCode(firstName);
    const expires = new Date();
    expires.setDate(expires.getDate() + config.couponValidDays);
    coupon = {
      code: couponCode,
      discountPercent: config.couponDiscountPercent,
      expiresOn: expires.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }

  const subject = applyTemplate(config.subjectTemplate, firstName);
  const message = applyTemplate(config.messageTemplate, firstName);

  let status = 'sent';
  let errorMessage = '';
  try {
    await sendEmail({
      to: user.email,
      subject,
      html: birthdayEmail({
        firstName,
        subject,
        message,
        backgroundImageUrl: config.backgroundImageUrl || DEFAULT_BACKGROUND,
        coupon,
      }),
    });
    await Notification.create({
      recipient: user._id,
      type: 'birthday',
      title: `🎉 Happy Birthday, ${firstName}!`,
      message: 'The whole team at Roxaval Travels is wishing you a wonderful day. Check your inbox for a little surprise!',
      link: '/my-tours',
      relatedModel: 'Customer',
      relatedId: customer._id,
    });
  } catch (err) {
    status = 'failed';
    errorMessage = err.message;
    logger.error(`Birthday email failed for customer ${customer._id}: ${err.message}`);
  }

  const log = await BirthdayLog.findOneAndUpdate(
    { customer: customer._id, year },
    {
      $set: { emailTo: user.email, status, method, errorMessage, sentAt: new Date(), ...(couponCode ? { couponCode } : {}) },
      $inc: { resendCount: method === 'manual' ? 1 : 0 },
    },
    { new: true, upsert: true }
  );

  return log;
};

/**
 * The daily job: sends to everyone whose birthday is today and who doesn't
 * already have a log row for this year. Safe to re-run (Vercel Cron retries,
 * or an admin hitting "Run now") since already-logged customers are skipped.
 */
const runDailyBirthdayJob = async () => {
  const year = new Date().getUTCFullYear();
  const todayCustomers = await getTodayBirthdays();
  const alreadySent = await BirthdayLog.find({ year, customer: { $in: todayCustomers.map((c) => c._id) } }).distinct('customer');
  const alreadySentSet = new Set(alreadySent.map(String));

  const results = [];
  for (const customer of todayCustomers) {
    if (alreadySentSet.has(String(customer._id))) continue;
    // eslint-disable-next-line no-await-in-loop
    const log = await sendBirthdayWish(customer, { method: 'auto' });
    if (log) results.push(log);
  }
  return { checked: todayCustomers.length, sent: results.filter((r) => r.status === 'sent').length, results };
};

module.exports = {
  DEFAULT_BACKGROUND,
  firstNameOf,
  getTodayBirthdays,
  getUpcomingBirthdays,
  sendBirthdayWish,
  runDailyBirthdayJob,
};
