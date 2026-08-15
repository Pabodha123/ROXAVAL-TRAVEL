
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { PublicLayout } from './components/layout/PublicLayout';
import { RequireAuth } from './components/layout/RequireAuth';

// Every route below is lazy-loaded: without this, one visitor browsing the
// public homepage was downloading the entire admin CRUD system (50+ pages)
// in the same bundle before seeing anything. Splitting per-route means a
// visitor only ever downloads the code for the page they're actually on.
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const TourPackages = lazy(() => import('./pages/TourPackages').then((m) => ({ default: m.TourPackages })));
const Destinations = lazy(() => import('./pages/Destinations').then((m) => ({ default: m.Destinations })));
const DestinationDetails = lazy(() => import('./pages/DestinationDetails').then((m) => ({ default: m.DestinationDetails })));
const Activities = lazy(() => import('./pages/Activities').then((m) => ({ default: m.Activities })));
const ActivityDetails = lazy(() => import('./pages/ActivityDetails').then((m) => ({ default: m.ActivityDetails })));
const TourPackageDetails = lazy(() => import('./pages/TourPackageDetails').then((m) => ({ default: m.TourPackageDetails })));
const SearchResults = lazy(() => import('./pages/SearchResults').then((m) => ({ default: m.SearchResults })));
const Auth = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Auth })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then((m) => ({ default: m.ResetPassword })));
const MyTours = lazy(() => import('./pages/MyTours').then((m) => ({ default: m.MyTours })));
const QuotationPreview = lazy(() => import('./pages/QuotationPreview').then((m) => ({ default: m.QuotationPreview })));
const Notifications = lazy(() => import('./pages/Notifications').then((m) => ({ default: m.Notifications })));
const AboutUs = lazy(() => import('./pages/AboutUs').then((m) => ({ default: m.AboutUs })));
const ContactUs = lazy(() => import('./pages/ContactUs').then((m) => ({ default: m.ContactUs })));
const Blog = lazy(() => import('./pages/Blog').then((m) => ({ default: m.Blog })));
const BlogDetails = lazy(() => import('./pages/BlogDetails').then((m) => ({ default: m.BlogDetails })));
const Reviews = lazy(() => import('./pages/Reviews').then((m) => ({ default: m.Reviews })));
const TermsConditions = lazy(() => import('./pages/TermsConditions').then((m) => ({ default: m.TermsConditions })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));

const AdminRoot = lazy(() => import('./admin/components/AdminRoot').then((m) => ({ default: m.AdminRoot })));
const RequireAdminAuth = lazy(() => import('./admin/components/RequireAdminAuth').then((m) => ({ default: m.RequireAdminAuth })));
const AdminLayout = lazy(() => import('./admin/components/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import('./admin/pages/Login').then((m) => ({ default: m.AdminLogin })));
const AdminForgotPassword = lazy(() => import('./admin/pages/ForgotPassword').then((m) => ({ default: m.AdminForgotPassword })));
const AdminResetPassword = lazy(() => import('./admin/pages/ResetPassword').then((m) => ({ default: m.AdminResetPassword })));
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminPackagesList = lazy(() => import('./admin/pages/packages/List').then((m) => ({ default: m.AdminPackagesList })));
const AdminPackageForm = lazy(() => import('./admin/pages/packages/Form').then((m) => ({ default: m.AdminPackageForm })));
const AdminDestinationsList = lazy(() => import('./admin/pages/destinations/List').then((m) => ({ default: m.AdminDestinationsList })));
const AdminDestinationForm = lazy(() => import('./admin/pages/destinations/Form').then((m) => ({ default: m.AdminDestinationForm })));
const AdminActivitiesList = lazy(() => import('./admin/pages/activities/List').then((m) => ({ default: m.AdminActivitiesList })));
const AdminActivityForm = lazy(() => import('./admin/pages/activities/Form').then((m) => ({ default: m.AdminActivityForm })));
const AdminHotelsList = lazy(() => import('./admin/pages/hotels/List').then((m) => ({ default: m.AdminHotelsList })));
const AdminHotelForm = lazy(() => import('./admin/pages/hotels/Form').then((m) => ({ default: m.AdminHotelForm })));
const AdminTourGuidesList = lazy(() => import('./admin/pages/tour-guides/List').then((m) => ({ default: m.AdminTourGuidesList })));
const AdminTourGuideForm = lazy(() => import('./admin/pages/tour-guides/Form').then((m) => ({ default: m.AdminTourGuideForm })));
const AdminVehiclesList = lazy(() => import('./admin/pages/vehicles/List').then((m) => ({ default: m.AdminVehiclesList })));
const AdminVehicleForm = lazy(() => import('./admin/pages/vehicles/Form').then((m) => ({ default: m.AdminVehicleForm })));
const AdminTransfersList = lazy(() => import('./admin/pages/transfers/List').then((m) => ({ default: m.AdminTransfersList })));
const AdminTransferForm = lazy(() => import('./admin/pages/transfers/Form').then((m) => ({ default: m.AdminTransferForm })));
const AdminBookingsList = lazy(() => import('./admin/pages/bookings/List').then((m) => ({ default: m.AdminBookingsList })));
const AdminBookingDetail = lazy(() => import('./admin/pages/bookings/Detail').then((m) => ({ default: m.AdminBookingDetail })));
const AdminPaymentsList = lazy(() => import('./admin/pages/payments/List').then((m) => ({ default: m.AdminPaymentsList })));
const AdminCustomersList = lazy(() => import('./admin/pages/customers/List').then((m) => ({ default: m.AdminCustomersList })));
const AdminCustomerNew = lazy(() => import('./admin/pages/customers/New').then((m) => ({ default: m.AdminCustomerNew })));
const AdminCustomerDetail = lazy(() => import('./admin/pages/customers/Detail').then((m) => ({ default: m.AdminCustomerDetail })));
const AdminReviewsList = lazy(() => import('./admin/pages/reviews/List').then((m) => ({ default: m.AdminReviewsList })));
const AdminBlogList = lazy(() => import('./admin/pages/blog/List').then((m) => ({ default: m.AdminBlogList })));
const AdminBlogForm = lazy(() => import('./admin/pages/blog/Form').then((m) => ({ default: m.AdminBlogForm })));
const AdminSettings = lazy(() => import('./admin/pages/settings/Settings').then((m) => ({ default: m.AdminSettings })));
const AdminProfile = lazy(() => import('./admin/pages/profile/Profile').then((m) => ({ default: m.AdminProfile })));
const AdminCustomRequestsList = lazy(() => import('./admin/pages/custom-requests/List').then((m) => ({ default: m.AdminCustomRequestsList })));
const AdminCustomRequestNew = lazy(() => import('./admin/pages/custom-requests/New').then((m) => ({ default: m.AdminCustomRequestNew })));
const AdminCustomRequestDetail = lazy(() => import('./admin/pages/custom-requests/Detail').then((m) => ({ default: m.AdminCustomRequestDetail })));
const AdminQuotationPreview = lazy(() => import('./admin/pages/custom-requests/QuotationPreview').then((m) => ({ default: m.AdminQuotationPreview })));
const AdminDocumentsList = lazy(() => import('./admin/pages/documents/List').then((m) => ({ default: m.AdminDocumentsList })));
const AdminNotifications = lazy(() => import('./admin/pages/notifications/Notifications').then((m) => ({ default: m.AdminNotifications })));
const AdminContactList = lazy(() => import('./admin/pages/contact/List').then((m) => ({ default: m.AdminContactList })));
const AdminBirthdaysList = lazy(() => import('./admin/pages/birthdays/List').then((m) => ({ default: m.AdminBirthdaysList })));

// Placeholders for other pages to ensure routing works
const Placeholder = ({ title }: {title: string;}) =>
<div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-cream">
    <h1 className="text-4xl font-display text-forest">{title} Page Coming Soon</h1>
  </div>;

const RouteFallback = () =>
<div className="grid min-h-screen place-items-center bg-cream">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
  </div>;


export function App() {
  // Catalog data (destinations, packages, activities, etc.) is fetched by
  // each page's own effects, most keyed on route params rather than
  // language - so switching languages via the navbar globe icon wouldn't
  // otherwise re-fetch already-loaded pages in their new language. Keying
  // the whole route tree on the active language forces a remount (and so a
  // fresh, correctly-localized fetch) on every switch.
  const { i18n } = useTranslation();
  return (
    <BrowserRouter>
      <AuthProvider>
      <ToastProvider>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
        <Routes key={i18n.language}>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<TourPackages />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<DestinationDetails />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activity/:id" element={<ActivityDetails />} />
          <Route path="/packages/:id" element={<TourPackageDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/my-tours" element={<RequireAuth><MyTours /></RequireAuth>} />
          <Route path="/my-tours/:section/:id" element={<RequireAuth><MyTours /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetails />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/account-settings" element={<RequireAuth><Placeholder title="Account Settings" /></RequireAuth>} />
        </Route>

        <Route path="/my-tours/requests/:id/quotation" element={<RequireAuth><QuotationPreview /></RequireAuth>} />

        <Route path="/admin" element={<AdminRoot />}>
          <Route path="login" element={<AdminLogin />} />
          <Route path="forgot-password" element={<AdminForgotPassword />} />
          <Route path="reset-password/:token" element={<AdminResetPassword />} />
          <Route path="custom-requests/:id/quotation" element={<RequireAdminAuth><AdminQuotationPreview /></RequireAdminAuth>} />

          <Route element={<RequireAdminAuth><AdminLayout /></RequireAdminAuth>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="packages" element={<AdminPackagesList />} />
            <Route path="packages/new" element={<AdminPackageForm />} />
            <Route path="packages/:id/edit" element={<AdminPackageForm />} />

            <Route path="destinations" element={<AdminDestinationsList />} />
            <Route path="destinations/new" element={<AdminDestinationForm />} />
            <Route path="destinations/:id/edit" element={<AdminDestinationForm />} />

            <Route path="activities" element={<AdminActivitiesList />} />
            <Route path="activities/new" element={<AdminActivityForm />} />
            <Route path="activities/:id/edit" element={<AdminActivityForm />} />

            <Route path="hotels" element={<AdminHotelsList />} />
            <Route path="hotels/new" element={<AdminHotelForm />} />
            <Route path="hotels/:id/edit" element={<AdminHotelForm />} />

            <Route path="tour-guides" element={<AdminTourGuidesList />} />
            <Route path="tour-guides/new" element={<AdminTourGuideForm />} />
            <Route path="tour-guides/:id/edit" element={<AdminTourGuideForm />} />

            <Route path="vehicles" element={<AdminVehiclesList />} />
            <Route path="vehicles/new" element={<AdminVehicleForm />} />
            <Route path="vehicles/:id/edit" element={<AdminVehicleForm />} />
            <Route path="transfers" element={<AdminTransfersList />} />
            <Route path="transfers/new" element={<AdminTransferForm />} />
            <Route path="transfers/:id/edit" element={<AdminTransferForm />} />

            <Route path="bookings" element={<AdminBookingsList />} />
            <Route path="bookings/:id" element={<AdminBookingDetail />} />

            <Route path="payments" element={<AdminPaymentsList />} />

            <Route path="customers" element={<AdminCustomersList />} />
            <Route path="customers/new" element={<AdminCustomerNew />} />
            <Route path="customers/:id" element={<AdminCustomerDetail />} />

            <Route path="reviews" element={<AdminReviewsList />} />

            <Route path="blog" element={<AdminBlogList />} />
            <Route path="blog/new" element={<AdminBlogForm />} />
            <Route path="blog/:id/edit" element={<AdminBlogForm />} />

            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />

            <Route path="custom-requests" element={<AdminCustomRequestsList />} />
            <Route path="custom-requests/new" element={<AdminCustomRequestNew />} />
            <Route path="custom-requests/:id" element={<AdminCustomRequestDetail />} />

            <Route path="documents" element={<AdminDocumentsList />} />

            <Route path="contact" element={<AdminContactList />} />

            <Route path="birthdays" element={<AdminBirthdaysList />} />

            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
        </Route>
        </Routes>
        </Suspense>
      </ToastProvider>
      </AuthProvider>
    </BrowserRouter>);

}
