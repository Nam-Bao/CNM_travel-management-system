import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthPage from "./features/auth/pages/AuthPage";
import AddTourPage from "./features/tours/pages/AddTourPage";
import HomePage from "./features/tours/pages/HomePage";
import AdminLayout from "./features/admin/components/AdminLayout";
import ManageToursPage from "./features/tours/pages/ManageToursPage";
import EditTourPage from "./features/tours/pages/EditTourPage";
import DashboardPage from "./features/admin/pages/DashboardPage";
import TourDetailPage from "./features/tours/pages/TourDetailPage";
import BookingHistory from "./features/bookings/pages/BookingHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chính */}
        <Route path="/" element={<HomePage />} />

        {/* Khách hàng */}
        <Route path="/tours/:slug" element={<TourDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/my-bookings" element={<BookingHistory />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="add-tour" element={<AddTourPage />} />
          <Route path="tours" element={<ManageToursPage />} />
          <Route path="edit-tour/:id" element={<EditTourPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
