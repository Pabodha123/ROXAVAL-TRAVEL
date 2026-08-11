const { Customer, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');

const getMyProfile = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id }).populate('user', '-password');
  if (!customer) throw ApiError.notFound('Customer profile not found');
  new ApiResponse(200, customer, 'Profile fetched').send(res);
});

const updateMyProfile = catchAsync(async (req, res) => {
  const { fullName, phone, avatar, ...customerFields } = req.body;

  if (fullName || phone || avatar) {
    await User.findByIdAndUpdate(req.user._id, { fullName, phone, avatar }, { runValidators: true });
  }

  const customer = await Customer.findOneAndUpdate({ user: req.user._id }, customerFields, {
    new: true,
    runValidators: true,
  }).populate('user', '-password');

  new ApiResponse(200, customer, 'Profile updated').send(res);
});

// Admin: Customer Management
const getAllCustomers = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Customer.find(), req.query).filter().sort().paginate();
  const docs = await features.query.populate('user', '-password');
  const meta = await features.getMeta(Customer);
  new ApiResponse(200, docs, 'Customers fetched', meta).send(res);
});

const getCustomerById = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate('user', '-password');
  if (!customer) throw ApiError.notFound('Customer not found');
  new ApiResponse(200, customer, 'Customer fetched').send(res);
});

const setCustomerActive = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found');
  await User.findByIdAndUpdate(customer.user, { active: req.body.active });
  new ApiResponse(200, null, `Customer account ${req.body.active ? 'enabled' : 'disabled'}`).send(res);
});

const updateNotes = catchAsync(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, { notes: req.body.notes || '' }, { new: true }).populate('user', '-password');
  if (!customer) throw ApiError.notFound('Customer not found');
  new ApiResponse(200, customer, 'Customer notes updated').send(res);
});

// Admin: edit profile details captured from a passport or other ID (e.g.
// during booking) rather than the customer's own self-service update.
const updateProfile = catchAsync(async (req, res) => {
  const { dateOfBirth, passportNumber, country, address } = req.body;
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { dateOfBirth, passportNumber, country, address },
    { new: true, runValidators: true }
  ).populate('user', '-password');
  if (!customer) throw ApiError.notFound('Customer not found');
  new ApiResponse(200, customer, 'Customer profile updated').send(res);
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllCustomers,
  getCustomerById,
  setCustomerActive,
  updateNotes,
  updateProfile,
};
