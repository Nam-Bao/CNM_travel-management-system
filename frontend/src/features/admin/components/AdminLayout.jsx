import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    // Dùng useLocation để biết user đang ở link nào, từ đó tô đậm menu tương ứng
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white';

    // Hàm đăng xuất nhanh
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
            {/* 1. SIDEBAR (Thanh điều hướng bên trái) */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20">
                {/* Logo Admin */}
                <div className="h-16 flex items-center justify-center border-b border-gray-800">
                    <h2 className="text-2xl font-black tracking-widest text-blue-500">
                        TRAVEL<span className="text-white">ADMIN</span>
                    </h2>
                </div>

                {/* Các Menu Link */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quản lý hệ thống</p>
                    
                    <Link to="/admin/dashboard" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin/dashboard')}`}>
                        📊 Bảng điều khiển
                    </Link>
                    {/* <Link to="/admin/add-tour" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin/add-tour')}`}>
                        ➕ Thêm Tour Mới
                    </Link> */}
                    <Link to="/admin/tours" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin/tours')}`}>
                        🗂️ Danh sách Tour
                    </Link>
                    <Link to="/admin/bookings" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin/bookings')}`}>
                        🎫 Quản lý Đặt chỗ
                    </Link>
                    <Link to="/admin/users" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin/users')}`}>
                        👥 Quản lý Người Dùng
                    </Link>
                </nav>

                {/* Nút Đăng xuất ở cuối Sidebar */}
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full flex justify-center items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-md">
                        🚪 Đăng xuất
                    </button>
                </div>
            </aside>

            {/* 2. MAIN CONTENT (Khu vực nội dung bên phải) */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Thanh Header nhỏ bên trên */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-end px-8 z-10 border-b">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700">👋 Chào Quản trị viên</span>
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                            AD
                        </div>
                    </div>
                </header>
                
                {/* Khu vực hiển thị các trang con (Outlet) */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* CHÚ Ý: Thẻ Outlet là nơi React Router sẽ "nhúng" trang AddTourPage vào */}
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;