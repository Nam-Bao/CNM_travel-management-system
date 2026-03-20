import React, { useState, useEffect } from 'react';
import tourApi from '../../tours/api/tourApi';
import userApi from '../../users/api/userApi';

const DashboardPage = () => {
    // State lưu trữ các con số thống kê
    const [stats, setStats] = useState({
        totalTours: 0,           // Sẽ lấy thật từ Database
        totalUsers: 0,           // Sẽ lấy thật từ Database
        totalBookings: 45,       // Tạm thời giả định
        revenue: 125000000       // Tạm thời giả định (125 triệu)
    });

    const [recentTours, setRecentTours] = useState([]);

    // Lấy dữ liệu thật từ API Tour và User
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Tối ưu hóa: Gọi 2 API cùng lúc bằng Promise.all
                const [tourRes, userRes] = await Promise.all([
                    tourApi.getAllTours(),
                    userApi.getAllUsers()
                ]);

                const tours = tourRes.data;
                const allUsers = userRes.data; 
                
                // LỌC LOGIC: Chỉ đếm những người có role là 'customer' hoặc 'user'
                const actualCustomers = allUsers.filter(user => user.role !== 'admin');
                
                setStats(prev => ({
                    ...prev,
                    totalTours: tours.length,
                    totalUsers: actualCustomers.length // Cập nhật số liệu đã lọc
                }));

                // FIX 1: Đảo ngược mảng (reverse) để lấy tour MỚI NHẤT, và lấy 5 tour cho đẹp
                setRecentTours([...tours].reverse().slice(0, 5));
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu Dashboard:', error);
            }
        };

        fetchDashboardData();
    }, []);

    // FIX 2: Hàm format số bình thường (Dùng cho Doanh thu)
    const formatRevenue = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // FIX 3: Hàm format giá Tour (Dùng để bóc tách Object giá vé)
    const formatTourPrice = (priceObject) => {
        if (priceObject?.adult !== undefined && priceObject?.adult !== null) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceObject.adult);
        }
        // Đề phòng database cũ còn sót lại giá trị là số
        if (typeof priceObject === 'number') {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceObject);
        }
        return 'Chưa cập nhật';
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">📊 Tổng quan hệ thống</h2>

            {/* Khung chứa 4 thẻ thống kê (Grid 4 cột) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Thẻ 1: Doanh thu */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-300">
                    <div className="text-green-100 text-sm font-bold uppercase tracking-wider mb-2">Tổng Doanh Thu</div>
                    <div className="text-3xl font-black">{formatRevenue(stats.revenue)}</div>
                    <div className="text-sm mt-4">↑ 12% so với tháng trước</div>
                </div>

                {/* Thẻ 2: Đơn đặt chỗ */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-300">
                    <div className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">Đơn Đặt Chỗ</div>
                    <div className="text-3xl font-black">{stats.totalBookings} <span className="text-lg font-medium">đơn</span></div>
                    <div className="text-sm mt-4">⏳ 5 đơn đang chờ xử lý</div>
                </div>

                {/* Thẻ 3: Số lượng Tour (Dữ liệu THẬT) */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-300">
                    <div className="text-purple-100 text-sm font-bold uppercase tracking-wider mb-2">Tour Đang Mở</div>
                    <div className="text-3xl font-black">{stats.totalTours} <span className="text-lg font-medium">tour</span></div>
                    <div className="text-sm mt-4">✓ Dữ liệu thực tế từ Database</div>
                </div>

                {/* Thẻ 4: Khách hàng (Dữ liệu THẬT) */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-300">
                    <div className="text-orange-100 text-sm font-bold uppercase tracking-wider mb-2">Khách Hàng</div>
                    <div className="text-3xl font-black">{stats.totalUsers} <span className="text-lg font-medium">người</span></div>
                    <div className="text-sm mt-4">⭐ Tỉ lệ hoạt động cao</div>
                </div>
            </div>

            {/* Khu vực hiển thị hoạt động gần đây */}
            <div className="mt-10 bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">🔥 Các Tour Vừa Được Thêm Gần Đây</h3>
                
                {recentTours.length > 0 ? (
                    <div className="space-y-4">
                        {recentTours.map((tour, index) => (
                            <div key={tour._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{tour.title}</h4>
                                        <p className="text-sm text-gray-500">Khởi hành: {new Date(tour.start_date).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* Sử dụng hàm formatTourPrice để in ra giá người lớn */}
                                    <div className="font-bold text-red-500">{formatTourPrice(tour.price)}</div>
                                    <div className="text-xs font-medium text-green-600 px-2 py-1 bg-green-100 rounded-full inline-block mt-1">
                                        Còn {tour.available_seats} chỗ
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">Chưa có tour nào để hiển thị.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;