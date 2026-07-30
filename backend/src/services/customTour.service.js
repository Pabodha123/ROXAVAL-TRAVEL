const { CustomTourRequest, Itinerary, Customer, Admin, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { notify, notifyAllAdmins } = require('./notification.service');

/**
 * Step 1: Customer submits a multi-step inquiry. Stored as 'Pending' and
 * immediately visible to admins on the dashboard.
 */
const submitRequest = async (customerUserId, payload) => {
  const customer = await Customer.findOne({ user: customerUserId }).populate('user', 'fullName');
  if (!customer) throw ApiError.notFound('Customer profile not found.');

  const request = await CustomTourRequest.create({
    ...payload,
    customer: customer._id,
    status: 'Pending',
    revisionHistory: [{ action: 'submitted', actor: customerUserId }],
  });

  await notifyAllAdmins({
    type: 'inquiry_received',
    title: 'New Custom Tour Inquiry',
    message: `New Custom Tour Inquiry from ${customer.user?.fullName || 'a customer'}`,
    link: `/admin/custom-requests/${request._id}`,
    relatedModel: 'CustomTourRequest',
    relatedId: request._id,
  });

  return request;
};

/**
 * Admin claims/assigns a pending request before working on it.
 */
const assignAdmin = async (requestId, adminId) => {
  const request = await CustomTourRequest.findById(requestId).populate({ path: 'customer', populate: 'user' });
  if (!request) throw ApiError.notFound('Custom tour request not found.');
  request.assignedAdmin = adminId;
  request.status = 'Under Review';
  await request.save();

  if (request.customer?.user) {
    await notify({
      recipient: request.customer.user._id,
      type: 'inquiry_updated',
      title: 'Your Inquiry is Being Reviewed',
      message: `Our travel experts have started reviewing your custom tour inquiry ${request.referenceNumber}.`,
      link: `/my-tours/requests/${request._id}`,
      relatedModel: 'CustomTourRequest',
      relatedId: request._id,
    });
  }

  return request;
};

/**
 * Step 2: Admin builds a personalized itinerary for a request and sends
 * it back to the customer's My Tours dashboard.
 */
const buildAndSendItinerary = async (requestId, adminId, itineraryPayload) => {
  const request = await CustomTourRequest.findById(requestId).populate({ path: 'customer', populate: 'user' });
  if (!request) throw ApiError.notFound('Custom tour request not found.');
  if (!['Pending', 'Under Review', 'Rejected'].includes(request.status)) {
    throw ApiError.badRequest(`Cannot build an itinerary for a request in '${request.status}' status.`);
  }

  let itinerary;
  if (request.itinerary) {
    // Revision: snapshot the current state into versionHistory for audit
    // purposes before overwriting it, then bump version.
    itinerary = await Itinerary.findById(request.itinerary);
    itinerary.versionHistory.push({
      version: itinerary.version,
      title: itinerary.title,
      summary: itinerary.summary,
      days: itinerary.days,
      hotels: itinerary.hotels,
      pricing: itinerary.pricing,
      adminNotes: itinerary.adminNotes,
      customerFacingNotes: itinerary.customerFacingNotes,
      changedBy: adminId,
      changedAt: new Date(),
    });
    Object.assign(itinerary, itineraryPayload);
    itinerary.preparedBy = adminId;
    itinerary.version += 1;
    itinerary.status = 'Sent';
    await itinerary.save();
  } else {
    itinerary = await Itinerary.create({
      customTourRequest: request._id,
      customer: request.customer._id,
      preparedBy: adminId,
      status: 'Sent',
      ...itineraryPayload,
    });
    request.itinerary = itinerary._id;
  }

  request.status = 'Awaiting Customer Approval';
  request.revisionHistory.push({ action: 'itinerary_sent', actor: adminId });
  await request.save();

  if (request.customer?.user) {
    await notify({
      recipient: request.customer.user._id,
      type: 'itinerary_ready',
      title: 'Your Custom Itinerary is Ready',
      message: 'Your Roxaval Travels itinerary has been prepared. Click here to review your tour.',
      link: `/my-tours/requests/${request._id}`,
      relatedModel: 'CustomTourRequest',
      relatedId: request._id,
      itinerary,
    });
  }

  return { request, itinerary };
};

/**
 * Step 3a: Customer accepts the proposed itinerary.
 */
const acceptItinerary = async (customerUserId, requestId) => {
  const customer = await Customer.findOne({ user: customerUserId });
  const request = await CustomTourRequest.findOne({ _id: requestId, customer: customer._id }).populate('itinerary');
  if (!request || !request.itinerary) throw ApiError.notFound('Itinerary not found for this request.');

  request.itinerary.status = 'Accepted';
  await request.itinerary.save();

  request.status = 'Approved';
  request.revisionHistory.push({ action: 'approved', actor: customerUserId });
  await request.save();

  if (request.assignedAdmin) {
    const admin = await Admin.findById(request.assignedAdmin).populate('user');
    if (admin?.user) {
      await notify({
        recipient: admin.user._id,
        type: 'itinerary_approved',
        title: 'Itinerary Approved',
        message: `The customer has approved the itinerary for request ${request.referenceNumber}. They may now proceed to booking.`,
        link: `/admin/custom-requests/${request._id}`,
        relatedModel: 'CustomTourRequest',
        relatedId: request._id,
      });
    }
  }

  return request;
};

/**
 * Step 3b: Customer rejects the proposed itinerary outright.
 */
const rejectItinerary = async (customerUserId, requestId) => {
  const customer = await Customer.findOne({ user: customerUserId });
  const request = await CustomTourRequest.findOne({ _id: requestId, customer: customer._id }).populate('itinerary');
  if (!request || !request.itinerary) throw ApiError.notFound('Itinerary not found for this request.');

  request.itinerary.status = 'Rejected';
  await request.itinerary.save();

  request.status = 'Rejected';
  request.revisionHistory.push({ action: 'rejected', actor: customerUserId });
  await request.save();

  if (request.assignedAdmin) {
    const admin = await Admin.findById(request.assignedAdmin).populate('user');
    if (admin?.user) {
      await notify({
        recipient: admin.user._id,
        type: 'general',
        title: 'Itinerary Rejected',
        message: `The customer has rejected the itinerary for request ${request.referenceNumber}.`,
        link: `/admin/custom-requests/${request._id}`,
        relatedModel: 'CustomTourRequest',
        relatedId: request._id,
      });
    }
  }

  return request;
};

/**
 * Step 3c: Customer requests changes; the request returns to the admin.
 */
const requestChanges = async (customerUserId, requestId, note) => {
  const customer = await Customer.findOne({ user: customerUserId });
  const request = await CustomTourRequest.findOne({ _id: requestId, customer: customer._id }).populate('itinerary');
  if (!request || !request.itinerary) throw ApiError.notFound('Itinerary not found for this request.');

  request.itinerary.status = 'Changes Requested';
  await request.itinerary.save();

  request.status = 'Under Review';
  request.revisionHistory.push({ action: 'changes_requested', note, actor: customerUserId });
  await request.save();

  if (request.assignedAdmin) {
    const admin = await Admin.findById(request.assignedAdmin).populate('user');
    if (admin?.user) {
      await notify({
        recipient: admin.user._id,
        type: 'changes_requested',
        title: 'Customer Requested Changes',
        message: `Changes were requested on ${request.referenceNumber}: "${note}"`,
        link: `/admin/custom-requests/${request._id}`,
        relatedModel: 'CustomTourRequest',
        relatedId: request._id,
      });
    }
  }

  return request;
};

/**
 * Admin declines a customer's change request outright (e.g. the requested
 * hotel is fully booked). Reverts the itinerary to 'Sent' so the customer
 * again sees the original proposal — with the admin's explanation attached
 * — and can still Accept / Reject / Request Changes (the loop continues).
 */
const respondCannotModify = async (requestId, adminId, note) => {
  const request = await CustomTourRequest.findById(requestId).populate({ path: 'customer', populate: 'user' });
  if (!request) throw ApiError.notFound('Custom tour request not found.');
  if (!request.itinerary) throw ApiError.badRequest('This request has no itinerary yet.');

  const itinerary = await Itinerary.findById(request.itinerary);
  if (itinerary.status !== 'Changes Requested') {
    throw ApiError.badRequest('There is no pending change request to respond to.');
  }

  itinerary.status = 'Sent';
  await itinerary.save();

  request.status = 'Awaiting Customer Approval';
  request.revisionHistory.push({ action: 'cannot_modify', note, actor: adminId });
  await request.save();

  if (request.customer?.user) {
    await notify({
      recipient: request.customer.user._id,
      type: 'cannot_modify',
      title: 'Update on Your Requested Changes',
      message: note,
      link: `/my-tours/requests/${request._id}`,
      relatedModel: 'CustomTourRequest',
      relatedId: request._id,
    });
  }

  return request;
};

module.exports = {
  submitRequest,
  assignAdmin,
  buildAndSendItinerary,
  acceptItinerary,
  rejectItinerary,
  requestChanges,
  respondCannotModify,
};
