
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { PublicLayout } from './components/layout/PublicLayout';
import { RequireAuth } from './components/layout/RequireAuth';
import { Home } from './pages/Home';
import { TourPackages } from './pages/TourPackages';
import { Destinations } from './pages/Destinations';
import { DestinationDetails } from './pages/DestinationDetails';
import { Activities } from './pages/Activities';
import { ActivityDetails } from './pages/ActivityDetails';
import { TourPackageDetails } from './pages/TourPackageDetails';
import { SearchResults } from './pages/SearchResults';
import { Auth } from './pages/Auth';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { MyTours } from './pages/MyTours';
import { QuotationPreview } from './pages/QuotationPreview';
import { Notifications } from './pages/Notifications';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { Blog } from './pages/Blog';
import { BlogDetails } from './pages/BlogDetails';
import { Reviews } from './pages/Reviews';
import { TermsConditions } from './pages/TermsConditions';
import { Profile } from './pages/Profile';

import { AdminRoot } from './admin/components/AdminRoot';
import { RequireAdminAuth } from './admin/components/RequireAdminAuth';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminLogin } from './admin/pages/Login';
import { AdminForgotPassword } from './admin/pages/ForgotPassword';
import { AdminResetPassword } from './admin/pages/ResetPassword';
import { AdminDashboard } from './admin/pages/Dashboard';
import { AdminPackagesList } from './admin/pages/packages/List';
import { AdminPackageForm } from './admin/pages/packages/Form';
import { AdminDestinationsList } from './admin/pages/destinations/List';
import { AdminDestinationForm } from './admin/pages/destinations/Form';
import { AdminActivitiesList } from './admin/pages/activities/List';
import { AdminActivityForm } from './admin/pages/activities/Form';
import { AdminHotelsList } from './admin/pages/hotels/List';
import { AdminHotelForm } from './admin/pages/hotels/Form';
import { AdminTourGuidesList } from './admin/pages/tour-guides/List';
import { AdminTourGuideForm } from './admin/pages/tour-guides/Form';
import { AdminVehiclesList } from './admin/pages/vehicles/List';
import { AdminVehicleForm } from './admin/pages/vehicles/Form';
import { AdminTransfersList } from './admin/pages/transfers/List';
import { AdminTransferForm } from './admin/pages/transfers/Form';
import { AdminBookingsList } from './admin/pages/bookings/List';
import { AdminBookingDetail } from './admin/pages/bookings/Detail';
import { AdminPaymentsList } from './admin/pages/payments/List';
import { AdminCustomersList } from './admin/pages/customers/List';
import { AdminCustomerNew } from './admin/pages/customers/New';
import { AdminCustomerDetail } from './admin/pages/customers/Detail';
import { AdminReviewsList } from './admin/pages/reviews/List';
import { AdminBlogList } from './admin/pages/blog/List';
import { AdminBlogForm } from './admin/pages/blog/Form';
import { AdminSettings } from './admin/pages/settings/Settings';
import { AdminProfile } from './admin/pages/profile/Profile';
import { AdminCustomRequestsList } from './admin/pages/custom-requests/List';
import { AdminCustomRequestNew } from './admin/pages/custom-requests/New';
import { AdminCustomRequestDetail } from './admin/pages/custom-requests/Detail';
import { AdminQuotationPreview } from './admin/pages/custom-requests/QuotationPreview';
import { AdminDocumentsList } from './admin/pages/documents/List';
import { AdminNotifications } from './admin/pages/notifications/Notifications';
import { AdminContactList } from './admin/pages/contact/List';
import { AdminBirthdaysList } from './admin/pages/birthdays/List';

// Placeholders for other pages to ensure routing works
const Placeholder = ({ title }: {title: string;}) =>
<div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-cream">
    <h1 className="text-4xl font-display text-forest">{title} Page Coming Soon</h1>
  </div>;


export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ToastProvider>
        <ScrollToTop />
        <Routes>
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
      </ToastProvider>
      </AuthProvider>
    </BrowserRouter>);

}
