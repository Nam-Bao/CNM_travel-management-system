import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './features/auth/pages/AuthPage';
import AddTourPage from './features/tours/pages/AddTourPage';
import HomePage from './features/tours/pages/HomePage';
import AdminLayout from './features/admin/components/AdminLayout';
import ManageToursPage from './features/tours/pages/ManageToursPage';
import EditTourPage from './features/tours/pages/EditTourPage';
import DashboardPage from './features/admin/pages/DashboardPage';
import TourDetailPage from './features/tours/pages/TourDetailPage';
import ManageUsersPage from './features/users/pages/ManageUsersPage';

function App() {
  return (
    <BrowserRouter>
        <Routes>
            {/* Đặt Trang Chủ làm mặc định */}
            <Route path="/" element={<HomePage />} />

            {/* Các trang dành cho Khách hàng */}
            <Route path="/" element={<HomePage />} />
            <Route path="/tours/:slug" element={<TourDetailPage />} /> {/* Thêm dòng này */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Trang Đăng nhập/Đăng ký */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Trang Admin thêm Tour */}
            {/* Nhóm các trang dành cho Admin (Được bọc bởi AdminLayout) */}
            <Route path="/admin" element={<AdminLayout />}>
                {/* Trang Dashboard sẽ là trang đầu tiên */}
                <Route path="dashboard" element={<DashboardPage />} />
                {/* Khi vào /admin/add-tour, nó sẽ hiển thị AdminLayout + AddTourPage ở giữa */}
                <Route path="add-tour" element={<AddTourPage />} />
                
                {/* trang quản lý danh sách sẽ thêm vào đây: */}
                <Route path="tours" element={<ManageToursPage />} />
                <Route path="edit-tour/:id" element={<EditTourPage />} />
                <Route path="users" element={<ManageUsersPage />} />
            </Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;