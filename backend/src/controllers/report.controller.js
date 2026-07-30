const { Report } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const reportService = require('../services/report.service');

const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await reportService.getDashboardStats();
  new ApiResponse(200, stats, 'Dashboard statistics fetched').send(res);
});

const getRevenueReport = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const data = await reportService.getRevenueReport(from, to);
  new ApiResponse(200, data, 'Revenue report generated').send(res);
});

const getBookingsReport = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const data = await reportService.getBookingsReport(from, to);
  new ApiResponse(200, data, 'Bookings report generated').send(res);
});

const saveReport = catchAsync(async (req, res) => {
  const { Admin } = require('../models');
  const admin = await Admin.findOne({ user: req.user._id });
  const report = await Report.create({ ...req.body, generatedBy: admin._id });
  new ApiResponse(201, report, 'Report saved').send(res);
});

const getSavedReports = catchAsync(async (req, res) => {
  const reports = await Report.find().sort('-createdAt').limit(50);
  new ApiResponse(200, reports, 'Saved reports fetched').send(res);
});

const getSavedReportById = catchAsync(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw ApiError.notFound('Report not found');
  new ApiResponse(200, report, 'Report fetched').send(res);
});

module.exports = {
  getDashboardStats,
  getRevenueReport,
  getBookingsReport,
  saveReport,
  getSavedReports,
  getSavedReportById,
};
