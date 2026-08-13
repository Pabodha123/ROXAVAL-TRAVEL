const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const hotelVoucherService = require('../services/hotelVoucher.service');

const generateForBooking = catchAsync(async (req, res) => {
  const vouchers = await hotelVoucherService.generateVouchersForBooking(req.params.id, req.user._id);
  new ApiResponse(201, vouchers, `${vouchers.length} hotel voucher(s) generated`).send(res);
});

const listForBooking = catchAsync(async (req, res) => {
  const result = await hotelVoucherService.listVouchersForBooking(req.params.id);
  new ApiResponse(200, result, 'Hotel vouchers fetched').send(res);
});

const getOne = catchAsync(async (req, res) => {
  const voucher = await hotelVoucherService.getVoucherById(req.params.id);
  new ApiResponse(200, voucher, 'Hotel voucher fetched').send(res);
});

const update = catchAsync(async (req, res) => {
  const voucher = await hotelVoucherService.updateVoucher(req.params.id, req.user._id, req.body);
  new ApiResponse(200, voucher, 'Hotel voucher updated').send(res);
});

const remove = catchAsync(async (req, res) => {
  await hotelVoucherService.deleteVoucher(req.params.id);
  new ApiResponse(200, null, 'Hotel voucher deleted').send(res);
});

const emailToHotel = catchAsync(async (req, res) => {
  const voucher = await hotelVoucherService.emailVoucher(req.params.id, 'hotel');
  new ApiResponse(200, voucher, 'Voucher emailed to hotel').send(res);
});

const emailToCustomer = catchAsync(async (req, res) => {
  const voucher = await hotelVoucherService.emailVoucher(req.params.id, 'customer');
  new ApiResponse(200, voucher, 'Voucher emailed to customer').send(res);
});

module.exports = { generateForBooking, listForBooking, getOne, update, remove, emailToHotel, emailToCustomer };
