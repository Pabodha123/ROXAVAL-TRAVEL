const { Customer, BirthdayConfig, BirthdayLog } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const env = require('../config/env');
const birthdayService = require('../services/birthday.service');

// Admin: today's birthdays, annotated with this year's send status per
// channel (email is sent automatically by the daily job; WhatsApp is always
// admin-triggered, see getWhatsAppMessage).
const getToday = catchAsync(async (req, res) => {
  const year = new Date().getUTCFullYear();
  const customers = await birthdayService.getTodayBirthdays();
  const logs = await BirthdayLog.find({ year, customer: { $in: customers.map((c) => c._id) } });
  const emailLogByCustomer = new Map(logs.filter((l) => l.channel === 'email').map((l) => [String(l.customer), l]));
  const whatsappLogByCustomer = new Map(logs.filter((l) => l.channel === 'whatsapp').map((l) => [String(l.customer), l]));
  const data = customers.map((c) => ({
    customer: c,
    log: emailLogByCustomer.get(String(c._id)) || null,
    whatsappLog: whatsappLogByCustomer.get(String(c._id)) || null,
  }));
  new ApiResponse(200, data, "Today's birthdays fetched").send(res);
});

// Admin: birthdays in the next N days (default 30), soonest first
const getUpcoming = catchAsync(async (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 30, 365);
  const upcoming = await birthdayService.getUpcomingBirthdays(days);
  const data = upcoming.map(({ customer, daysUntil }) => ({ customer, daysUntil }));
  new ApiResponse(200, data, 'Upcoming birthdays fetched').send(res);
});

// Admin: message template + coupon settings
const getConfig = catchAsync(async (req, res) => {
  const config = await BirthdayConfig.getSingleton();
  new ApiResponse(200, config, 'Birthday config fetched').send(res);
});

const updateConfig = catchAsync(async (req, res) => {
  const config = await BirthdayConfig.getSingleton();
  Object.assign(config, req.body);
  await config.save();
  new ApiResponse(200, config, 'Birthday config updated').send(res);
});

// Admin: manually (re)send a birthday wish to one customer, bypassing the
// "already sent this year" idempotency check the daily job relies on.
const resend = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.customerId).populate('user', 'fullName email');
  if (!customer) throw ApiError.notFound('Customer not found');
  if (!customer.user?.email) throw ApiError.badRequest('This customer has no linked email address');

  const log = await birthdayService.sendBirthdayWish(customer, { method: 'manual' });
  if (log.status === 'failed') {
    throw ApiError.badRequest(`Failed to send birthday email: ${log.errorMessage}`);
  }
  new ApiResponse(200, log, 'Birthday wish sent').send(res);
});

// Admin: builds the WhatsApp birthday message for one customer and logs it
// as sent — returns the phone + message text for the admin to open as a
// wa.me link (no WhatsApp Business API is wired up, see prepareWhatsAppWish).
const getWhatsAppMessage = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.customerId).populate('user', 'fullName phone');
  if (!customer) throw ApiError.notFound('Customer not found');
  if (!customer.user?.phone) throw ApiError.badRequest('This customer has no phone number on file');

  const { phone, message } = await birthdayService.prepareWhatsAppWish(customer);
  new ApiResponse(200, { phone, message }, 'WhatsApp birthday message ready').send(res);
});

// Admin: paginated delivery log (email status history)
const getLogs = catchAsync(async (req, res) => {
  const features = new ApiFeatures(BirthdayLog.find(), req.query).filter().sort().paginate();
  const docs = await features.query.populate({ path: 'customer', populate: { path: 'user', select: 'fullName email' } }).sort('-sentAt');
  const meta = await features.getMeta(BirthdayLog);
  new ApiResponse(200, docs, 'Birthday delivery log fetched', meta).send(res);
});

// Admin: "Run now" button — same job the daily cron runs, triggerable on demand.
const runNow = catchAsync(async (req, res) => {
  const result = await birthdayService.runDailyBirthdayJob();
  new ApiResponse(200, result, `Checked ${result.checked} birthday(s), sent ${result.sent}`).send(res);
});

// Cron-only: hit by Vercel Cron once a day. Authenticated via a shared
// secret header (no admin session exists in a cron invocation) rather than
// the normal protect()/restrictTo() stack.
const runDailyCron = catchAsync(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    throw ApiError.unauthorized('Invalid cron secret');
  }
  const result = await birthdayService.runDailyBirthdayJob();
  new ApiResponse(200, result, `Checked ${result.checked} birthday(s), sent ${result.sent}`).send(res);
});

// Customer: does today's date match my birthday? Powers the confetti card
// shown in the dashboard after login.
const getMyBirthdayToday = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id }).populate('user', 'fullName');
  if (!customer?.dateOfBirth) {
    return new ApiResponse(200, { isBirthdayToday: false }, 'Not a birthday today').send(res);
  }

  const today = new Date();
  const dob = new Date(customer.dateOfBirth);
  const isBirthdayToday = dob.getUTCMonth() === today.getUTCMonth() && dob.getUTCDate() === today.getUTCDate();
  if (!isBirthdayToday) {
    return new ApiResponse(200, { isBirthdayToday: false }, 'Not a birthday today').send(res);
  }

  const config = await BirthdayConfig.getSingleton();
  const firstName = birthdayService.firstNameOf(customer.user.fullName);
  const year = today.getUTCFullYear();
  const log = await BirthdayLog.findOne({ customer: customer._id, year });

  new ApiResponse(200, {
    isBirthdayToday: true,
    firstName,
    message: config.messageTemplate.replace(/\{\{\s*firstName\s*\}\}/g, firstName),
    backgroundImageUrl: config.backgroundImageUrl || birthdayService.DEFAULT_BACKGROUND,
    coupon: config.couponEnabled && log?.couponCode ?
    { code: log.couponCode, discountPercent: config.couponDiscountPercent } :
    null,
  }, "It's your birthday!").send(res);
});

module.exports = {
  getToday,
  getUpcoming,
  getConfig,
  updateConfig,
  resend,
  getWhatsAppMessage,
  getLogs,
  runNow,
  runDailyCron,
  getMyBirthdayToday,
};
