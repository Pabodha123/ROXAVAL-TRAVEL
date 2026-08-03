const { Contact } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const factory = require('./factory');
const env = require('../config/env');
const { sendEmail } = require('../utils/email');
const { contactInquiryEmail } = require('../utils/emailTemplates');
const { notifyAllAdmins } = require('../services/notification.service');

const base = factory(Contact, { searchableFields: ['name', 'email', 'subject', 'message'] });

// Public: submit a Contact Us inquiry
const create = catchAsync(async (req, res) => {
  const contact = await Contact.create(req.body);

  await sendEmail({
    to: env.COMPANY.email || 'info@roxavaltravels.com',
    subject: `New Contact Inquiry: ${contact.subject}`,
    html: contactInquiryEmail(contact),
  });

  await notifyAllAdmins({
    type: 'general',
    title: 'New Contact Inquiry',
    message: `${contact.name} sent a message: "${contact.subject}"`,
    link: '/admin/contact',
    relatedModel: 'Contact',
    relatedId: contact._id,
  });

  new ApiResponse(201, contact, 'Thank you — we will get back to you shortly').send(res);
});

// Admin: mark as read/responded
const updateStatus = catchAsync(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!contact) throw ApiError.notFound('Contact inquiry not found');
  new ApiResponse(200, contact, 'Status updated').send(res);
});

module.exports = { ...base, create, updateStatus };
