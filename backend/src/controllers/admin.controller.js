const { Admin, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');

// Superadmin creates a new admin/staff account
const createAdmin = catchAsync(async (req, res) => {
  const { fullName, email, phone, password, department, permissions, isSuperAdmin } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: isSuperAdmin ? 'superadmin' : 'admin',
  });
  const admin = await Admin.create({ user: user._id, department, permissions, isSuperAdmin: !!isSuperAdmin });

  new ApiResponse(201, { user, admin }, 'Admin account created').send(res);
});

const getAllAdmins = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Admin.find(), req.query).filter().sort().paginate();
  const docs = await features.query.populate('user', '-password');
  const meta = await features.getMeta(Admin);
  new ApiResponse(200, docs, 'Admins fetched', meta).send(res);
});

const updateAdmin = catchAsync(async (req, res) => {
  const { department, permissions, isSuperAdmin } = req.body;
  const admin = await Admin.findByIdAndUpdate(req.params.id, { department, permissions, isSuperAdmin }, { new: true });
  if (!admin) throw ApiError.notFound('Admin not found');
  new ApiResponse(200, admin, 'Admin updated').send(res);
});

const setAdminActive = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw ApiError.notFound('Admin not found');
  await User.findByIdAndUpdate(admin.user, { active: req.body.active });
  new ApiResponse(200, null, `Admin account ${req.body.active ? 'enabled' : 'disabled'}`).send(res);
});

const getMyAdminProfile = catchAsync(async (req, res) => {
  const admin = await Admin.findOne({ user: req.user._id }).populate('user', '-password');
  if (!admin) throw ApiError.notFound('Admin profile not found');
  new ApiResponse(200, admin, 'Admin profile fetched').send(res);
});

const updateMyAdminProfile = catchAsync(async (req, res) => {
  const { fullName, phone, avatar } = req.body;
  if (fullName || phone || avatar) {
    await User.findByIdAndUpdate(req.user._id, { fullName, phone, avatar }, { runValidators: true });
  }
  const admin = await Admin.findOne({ user: req.user._id }).populate('user', '-password');
  if (!admin) throw ApiError.notFound('Admin profile not found');
  new ApiResponse(200, admin, 'Profile updated').send(res);
});

module.exports = { createAdmin, getAllAdmins, updateAdmin, setAdminActive, getMyAdminProfile, updateMyAdminProfile };
