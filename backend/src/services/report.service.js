const { Booking, CustomTourRequest, TourPackage, Destination, Customer, Payment } = require('../models');

/**
 * Computes the live figures shown on the Admin Dashboard home screen.
 * Nothing here is persisted; use reportService.saveReport() separately
 * if an admin wants to snapshot/export a report.
 */
const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalBookings, monthlyRevenueAgg, pendingInquiries, totalCustomers, recentBookings] = await Promise.all([
    Booking.countDocuments({ status: { $ne: 'Cancelled' } }),
    Booking.aggregate([
      { $match: { status: 'Confirmed', updatedAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } },
    ]),
    CustomTourRequest.countDocuments({ status: { $in: ['Pending', 'In Review'] } }),
    Customer.countDocuments(),
    Booking.find().sort('-createdAt').limit(10).populate('tourPackage', 'name').populate({
      path: 'customer',
      populate: { path: 'user', select: 'fullName' },
    }),
  ]);

  const popularDestinations = await Destination.aggregate([
    { $match: { status: 'published' } },
    { $sort: { isFeatured: -1 } },
    { $limit: 5 },
    { $project: { name: 1, tag: 1, heroImage: 1 } },
  ]);

  const popularPackages = await TourPackage.find({ status: 'published' })
    .sort('-reviewsCount -rating')
    .limit(5)
    .select('name price rating reviewsCount heroImage');

  return {
    totalBookings,
    monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    pendingInquiries,
    totalCustomers,
    popularDestinations,
    popularPackages,
    recentActivity: recentBookings.map((b) => ({
      bookingReference: b.bookingReference,
      customerName: b.customer?.user?.fullName,
      packageName: b.tourPackage?.name || 'Customized Tour',
      status: b.status,
      createdAt: b.createdAt,
    })),
  };
};

const getRevenueReport = async (from, to) => {
  return Booking.aggregate([
    { $match: { status: 'Confirmed', updatedAt: { $gte: new Date(from), $lte: new Date(to) } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
        revenue: { $sum: '$pricing.totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

const getBookingsReport = async (from, to) => {
  return Booking.aggregate([
    { $match: { createdAt: { $gte: new Date(from), $lte: new Date(to) } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
};

module.exports = { getDashboardStats, getRevenueReport, getBookingsReport };
