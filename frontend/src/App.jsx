import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth & Layout
import AuthPage from "./features/auth/pages/AuthPage";
import AdminLayout from "./features/admin/components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Tours
import HomePage from "./features/tours/pages/HomePage";
import TourDetailPage from "./features/tours/pages/TourDetailPage";
import AddTourPage from "./features/tours/pages/AddTourPage";
import ManageToursPage from "./features/tours/pages/ManageToursPage";
import EditTourPage from "./features/tours/pages/EditTourPage";
import DashboardPage from "./features/admin/pages/DashboardPage";
import BookingHistory from "./features/bookings/pages/BookingHistory";
import ManageBookings from "./features/admin/pages/ManageBookings";
import VnpayReturn from "./features/bookings/pages/VnpayReturn";
import BookingTour from "./features/bookings/pages/BookingTour";
import InternationalBookingConfirm from "./features/bookings/pages/InternationalBookingConfirm";
import MainLayout from "./components/layout/MainLayout";
import ManageUsersPage from "./features/users/pages/ManageUsersPage";
import HotelListing from "./features/hotels/pages/HotelListing";
import HotelDetail from "./features/hotels/pages/HotelDetail";
import HotelBookingPage from "./features/hotels/pages/HotelBookingPage";

function App() {
  return (
    /* ✅ Thêm future flags vào đây để tắt cảnh báo v7 trong Console */
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* ========================================================
            NHÓM NGƯỜI DÙNG (Có Header/Footer của MainLayout) 
        ======================================================== */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotels" element={<HotelListing />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/hotel-booking/:id" element={<HotelBookingPage />} />
          <Route path="/tours/:slug" element={<TourDetailPage />} />
          <Route path="/my-bookings" element={<BookingHistory />} />
          <Route path="/booking-tour" element={<BookingTour />} />
          <Route path="/booking-international-confirm" element={<InternationalBookingConfirm />} />
          <Route path="/vnpay-return" element={<VnpayReturn />} />
        </Route>

        {/* ========================================================
            NHÓM AUTH (Login/Register) 
        ======================================================== */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* ========================================================
            NHÓM ADMIN (CÓ BẢO VỆ)
        ======================================================== */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="add-tour" element={<AddTourPage />} />
            <Route path="tours" element={<ManageToursPage />} />
            <Route path="edit-tour/:id" element={<EditTourPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="bookings" element={<ManageBookings />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="p-20 text-center font-bold">
              404 - Trang không tồn tại
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
