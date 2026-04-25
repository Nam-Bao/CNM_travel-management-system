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

// Bookings - ✅ SỬA ĐƯỜNG DẪN Ở ĐÂY CHO THỊNH
import BookingHistory from "./features/bookings/pages/BookingHistory";
import CheckoutPage from "./features/bookings/pages/CheckoutPage"; // Khớp với thư mục bookings/pages

// Admin & Users
import DashboardPage from "./features/admin/pages/DashboardPage";
import ManageBookings from "./features/admin/pages/ManageBookings";
import ManageUsersPage from "./features/users/pages/ManageUsersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- KHÁCH HÀNG --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/tours/:slug" element={<TourDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Route thanh toán & lịch sử */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/my-bookings" element={<BookingHistory />} />

        {/* --- ADMIN (CÓ BẢO VỆ) --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />{" "}
            {/* Mặc định vào dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="add-tour" element={<AddTourPage />} />
            <Route path="tours" element={<ManageToursPage />} />
            <Route path="edit-tour/:id" element={<EditTourPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="bookings" element={<ManageBookings />} />{" "}
            {/* Sửa lại path cho gọn */}
          </Route>
        </Route>

        {/* 404 - Nếu rảnh Thịnh làm thêm trang này nhé */}
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
