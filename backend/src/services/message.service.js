const { CustomTourRequest, Customer, Admin, Message } = require('../models');
const ApiError = require('../utils/ApiError');
const { notify, notifyAllAdmins } = require('./notification.service');

// Customers may only see/send messages on their own request; admins can act on any request.
const loadRequestForUser = async (userId, role, requestId) => {
  const query = role === 'customer' ?
    (async () => {
      const customer = await Customer.findOne({ user: userId });
      if (!customer) return null;
      return CustomTourRequest.findOne({ _id: requestId, customer: customer._id }).populate({ path: 'customer', populate: 'user' });
    })() :
    CustomTourRequest.findById(requestId).populate({ path: 'customer', populate: 'user' });

  const request = await query;
  if (!request) throw ApiError.notFound('Custom tour request not found.');
  return request;
};

const listMessages = async (userId, role, requestId) => {
  await loadRequestForUser(userId, role, requestId);
  return Message.find({ customTourRequest: requestId }).sort('createdAt').populate('sender', 'fullName');
};

const sendMessage = async (userId, role, requestId, text) => {
  const request = await loadRequestForUser(userId, role, requestId);

  const message = await Message.create({
    customTourRequest: requestId,
    sender: userId,
    senderRole: role === 'customer' ? 'customer' : 'admin',
    text,
  });

  if (role === 'customer') {
    const customerName = request.customer?.user?.fullName || 'A customer';
    if (request.assignedAdmin) {
      const admin = await Admin.findById(request.assignedAdmin).populate('user');
      if (admin?.user) {
        await notify({
          recipient: admin.user._id,
          type: 'message_received',
          title: `New Message — ${customerName}`,
          message: `${customerName} sent a message on request ${request.referenceNumber}: "${text}"`,
          link: `/admin/custom-requests/${request._id}`,
          relatedModel: 'CustomTourRequest',
          relatedId: request._id,
        });
      }
    } else {
      await notifyAllAdmins({
        type: 'message_received',
        title: `New Message — ${customerName}`,
        message: `${customerName} sent a message on request ${request.referenceNumber}: "${text}"`,
        link: `/admin/custom-requests/${request._id}`,
        relatedModel: 'CustomTourRequest',
        relatedId: request._id,
      });
    }
  } else if (request.customer?.user) {
    await notify({
      recipient: request.customer.user._id,
      type: 'message_received',
      title: 'New Message from Roxaval Travels',
      message: `Our travel experts replied on your request ${request.referenceNumber}: "${text}"`,
      link: `/my-tours`,
      relatedModel: 'CustomTourRequest',
      relatedId: request._id,
    });
  }

  return message.populate('sender', 'fullName');
};

module.exports = { listMessages, sendMessage };
