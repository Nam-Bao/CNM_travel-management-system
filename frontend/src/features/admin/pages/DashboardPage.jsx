import React, { useState, useEffect } from "react";
import tourApi from "../../tours/api/tourApi";
import userApi from "../../users/api/userApi";
import axios from "axios"; // Import thêm axios để gọi API Booking

const DashboardPage = () => {
  // State lưu trữ các con số thống kê
  const [stats, setStats] = useState({
    totalTours: 0, 
    openTours: 0, // Dành riêng cho thẻ màu tím (Tour đang mở)
    totalUsers: 0, 
    totalBookings: 0, 
    revenue: 0, 
  });

  const [recentTours, setRecentTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu thật từ API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // YÊU CẦU 1: Gọi cả 3 API cùng lúc để lấy dữ liệu thật
        const [tourRes, userRes, bookingRes] = await Promise.all([
          tourApi.getAllTours(),
          userApi.getAllUsers(),
          axios.get("http://localhost:5000/api/bookings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const tours = tourRes.data;
        const allUsers = userRes.data;
        const bookings = bookingRes.data?.data || bookingRes.data || [];

        // 1. Thống kê Khách hàng
        const actualCustomers = allUsers.filter((user) => user.role !== "admin");

        // 2. YÊU CẦU 2: Lọc Tour đang mở (Chưa khởi hành)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const openToursCount = tours.filter(tour => {
            const startDate = new Date(tour.start_date);
            startDate.setHours(0, 0, 0, 0);
            return startDate.getTime() > today.getTime(); // Lớn hơn hôm nay là chưa khởi hành
        }).length;

        // 3. Thống kê Doanh thu & Đơn hàng thật
        // 3. Thống kê Doanh thu & Đơn hàng thật
        // FIX: Trừ đi số tiền đã hoàn trả cho khách nếu đơn bị hủy
        const totalRevenue = bookings.reduce((sum, booking) => {
            if (booking.status === 'CANCELED') {
                // Doanh thu giữ lại = Tổng tiền ban đầu - Tiền đã trả lại cho khách
                const keptAmount = (booking.total_price || 0) - (booking.refund_amount || 0);
                return sum + keptAmount;
            }
            // Nếu đơn bình thường (Thành công) thì cộng full tiền
            return sum + (booking.total_price || 0);
        }, 0);

        // Cập nhật State
        setStats({
          totalTours: tours.length,
          openTours: openToursCount,
          totalUsers: actualCustomers.length,
          totalBookings: bookings.length,
          revenue: totalRevenue,
        });

        // 4. FIX SẠN: Sắp xếp lấy 5 Tour MỚI NHẤT theo thời gian tạo (createdAt) thay vì reverse
        const sortedTours = [...tours].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTours(sortedTours.slice(0, 5));

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRevenue = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatTourPrice = (priceObject) => {
    if (priceObject?.adult !== undefined && priceObject?.adult !== null) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(priceObject.adult);
    }
    if (typeof priceObject === "number") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(priceObject);
    }
    return "Chưa cập nhật";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-600 font-bold">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Đang đồng bộ dữ liệu tổng quan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        📊 Tổng quan hệ thống
      </h2>

      {/* Khung chứa 4 thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Thẻ 1: Doanh thu */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-300">
          <div className="text-green-100 text-sm font-bold uppercase tracking-wider mb-2">
            Tổng Doanh Thu
          </div>
          <div className="text-3xl font-black truncate" title={formatRevenue(stats.revenue)}>
            {formatRevenue(stats.revenue)}
          </div>
          <div className="text-sm mt-4">💰 Doanh thu thực tế từ hệ thống</div>
        </div>

        {/* Thẻ 2: Đơn đặt chỗ */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-300">
          <div className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">
            Đơn Đặt Chỗ
          </div>
          <div className="text-3xl font-black">
            {stats.totalBookings} <span className="text-lg font-medium">đơn</span>
          </div>
          <div className="text-sm mt-4">📦 Đã ghi nhận trên Database</div>
        </div>

        {/* Thẻ 3: Số lượng Tour đang mở */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-300">
          <div className="text-purple-100 text-sm font-bold uppercase tracking-wider mb-2">
            Tour Đang Mở
          </div>
          <div className="text-3xl font-black">
            {stats.openTours} <span className="text-lg font-medium">/ {stats.totalTours} tour</span>
          </div>
          <div className="text-sm mt-4">✓ Các tour chưa khởi hành</div>
        </div>

        {/* Thẻ 4: Khách hàng */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-300">
          <div className="text-orange-100 text-sm font-bold uppercase tracking-wider mb-2">
            Khách Hàng
          </div>
          <div className="text-3xl font-black">
            {stats.totalUsers} <span className="text-lg font-medium">người</span>
          </div>
          <div className="text-sm mt-4">⭐ Tài khoản thành viên</div>
        </div>
      </div>

      {/* Khu vực hiển thị hoạt động gần đây */}
      <div className="mt-10 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
          🔥 Các Tour Vừa Được Thêm Gần Đây
        </h3>

        {recentTours.length > 0 ? (
          <div className="space-y-4">
            {recentTours.map((tour, index) => {
              // FIX SẠN: Khử giờ/phút/giây để kiểm tra chính xác ngày kết thúc
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const startDate = new Date(tour.start_date);
              startDate.setHours(0, 0, 0, 0);
              
              // Nếu ngày bắt đầu <= ngày hôm nay (Đã đến ngày đi hoặc đã đi qua)
              const isTourStartedOrEnded = startDate.getTime() <= today.getTime();

              return (
                <div
                  key={tour._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${isTourStartedOrEnded ? "bg-gray-100 text-gray-400" : "bg-blue-100 text-blue-600"}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className={`font-bold ${isTourStartedOrEnded ? "text-gray-400 line-through" : "text-gray-800"}`}>
                        {tour.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Khởi hành: {new Date(tour.start_date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${isTourStartedOrEnded ? "text-gray-400" : "text-red-500"}`}>
                      {formatTourPrice(tour.price)}
                    </div>
                    {isTourStartedOrEnded ? (
                      <div className="text-xs font-bold text-gray-500 px-2 py-1 bg-gray-100 rounded-full inline-block mt-1">
                        Đã chốt danh sách
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-green-700 px-2 py-1 bg-green-100 rounded-full inline-block mt-1">
                        Còn {tour.available_seats} chỗ
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Chưa có tour nào để hiển thị.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;