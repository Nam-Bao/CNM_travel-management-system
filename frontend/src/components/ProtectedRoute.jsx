import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    // 1. Lấy thông tin từ "thẻ căn cước" trong LocalStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // 2. Kịch bản 1: Chưa đăng nhập (Không có token) -> Đuổi ra trang Đăng nhập
    if (!token || !userStr) {
        alert('⚠️ Bạn cần đăng nhập để truy cập trang này!');
        return <Navigate to="/auth" replace />;
    }

    // Giải mã thông tin user
    const user = JSON.parse(userStr);

    // 3. Kịch bản 2: Đã đăng nhập nhưng sai Quyền (Role) -> Đuổi về Trang chủ
    // Ví dụ: Trang này yêu cầu ['admin'], nhưng user.role lại là 'customer'
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        alert('⛔ CẢNH BÁO: Bạn không có quyền truy cập khu vực Quản trị!');
        return <Navigate to="/" replace />;
    }

    // 4. Kịch bản 3: Hợp lệ 100% -> Mở cửa cho đi tiếp (Render các trang con)
    return <Outlet />;
};

export default ProtectedRoute;