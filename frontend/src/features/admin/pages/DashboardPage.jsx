import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 🔥 Import thêm useNavigate
import tourApi from "../../tours/api/tourApi";
import userApi from "../../users/api/userApi";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const DashboardPage = () => {
  const navigate = useNavigate(); // 🔥 Khởi tạo navigate
  const [stats, setStats] = useState({
    totalTours: 0, openTours: 0, totalUsers: 0, totalBookings: 0, revenue: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 THÊM STATE LƯU SỐ LƯỢNG ĐƠN SẮP HẾT HẠN
  const [deadlineCount, setDeadlineCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [tourRes, userRes, bookingRes] = await Promise.all([
          tourApi.getAllTours(),
          userApi.getAllUsers(),
          axios.get("http://localhost:5000/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const tours = tourRes.data;
        const allUsers = userRes.data;
        const bookingsData = bookingRes.data?.data || bookingRes.data || [];
        setBookings(bookingsData);

        const actualCustomers = allUsers.filter((user) => user.role !== "admin");
        const today = new Date();
        today.setHours(0,0,0,0);

        const openToursCount = tours.filter(tour => new Date(tour.start_date) > today).length;

        const totalRevenue = bookingsData.reduce((sum, b) => {
          const actualPaid = (b.total_price * (b.payment_percent || 100)) / 100;
          if (b.status === 'CANCELED') return sum + (actualPaid - (b.refund_amount || 0));
          return sum + actualPaid;
        }, 0);

        // 🔥 LOGIC TÍNH TOÁN ĐƠN SẮP ĐẾN HẠN ĐÓNG TIỀN (<= 10 ngày)
        let countDeadline = 0;
        bookingsData.forEach(b => {
            if (b.status !== 'CANCELED' && b.payment_percent === 50 && b.tour?.start_date) {
                const startDate = new Date(b.tour.start_date);
                startDate.setHours(0,0,0,0);
                const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 10) countDeadline++;
            }
        });
        setDeadlineCount(countDeadline);

        setStats({
          totalTours: tours.length, openTours: openToursCount,
          totalUsers: actualCustomers.length, totalBookings: bookingsData.length, revenue: totalRevenue,
        });

      } catch (error) {
        console.error("Lỗi Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const revenueData = useMemo(() => {
    const months = ["Th 1", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "Th 8", "Th 9", "Th 10", "Th 11", "Th 12"];
    const currentYear = new Date().getFullYear();
    return months.map((month, index) => {
      const revenue = bookings
        .filter(b => new Date(b.createdAt).getMonth() === index && new Date(b.createdAt).getFullYear() === currentYear)
        .reduce((sum, b) => sum + (b.total_price * (b.payment_percent || 100) / 100), 0);
      return { name: month, doanhThu: revenue };
    });
  }, [bookings]);

  const statusData = useMemo(() => {
    const canceled = bookings.filter(b => b.status === 'CANCELED').length;
    const deposit = bookings.filter(b => b.payment_percent === 50 && b.status !== 'CANCELED').length;
    const full = bookings.filter(b => b.payment_percent === 100 && b.status !== 'CANCELED').length;
    return [
      { name: "Đã hủy", value: canceled, color: "#EF4444" },
      { name: "Đã cọc 50%", value: deposit, color: "#F59E0B" },
      { name: "Thanh toán 100%", value: full, color: "#10B981" },
    ];
  }, [bookings]);

  const formatPrice = (p) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

  if (loading) return <div className="p-20 text-center font-bold text-blue-600 animate-pulse">🚀 Đang khởi tạo Dashboard...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <span className="p-2 bg-blue-600 text-white rounded-lg text-sm"></span>Dashboard Quản Trị 
        </h2>
      </div>

      {/* 🔥 WIDGET CẢNH BÁO: CHỈ HIỆN KHI CÓ ĐƠN SẮP ĐẾN HẠN 🔥 */}
      {deadlineCount > 0 && (
        <div 
            // CHÚ Ý: Đổi đường dẫn '/bookings' dưới đây cho khớp với route Admin của bạn
            onClick={() => navigate('/admin/bookings', { state: { filterDeadline: true } })}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex justify-between items-center cursor-pointer hover:bg-red-100 transition animate-fade-in-up"
        >
            <div className="flex items-center gap-4">
                <span className="text-3xl animate-pulse">⚠️</span>
                <div>
                    <h3 className="font-black text-red-700">Cần thu hồi công nợ!</h3>
                    <p className="text-sm text-red-600 mt-1">
                        Phát hiện <span className="font-black text-lg bg-red-200 px-2 py-0.5 rounded">{deadlineCount}</span> đơn hàng đã cọc 50% sắp đến ngày khởi hành (≤ 10 ngày).
                    </p>
                </div>
            </div>
            <button className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm shadow hover:bg-red-700 transition">
                Xem danh sách ➔
            </button>
        </div>
      )}

      {/* 4 Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng doanh thu" value={formatPrice(stats.revenue)} color="from-green-500 to-emerald-600" icon="💰" />
        <StatCard title="Đơn đặt chỗ" value={stats.totalBookings} unit=" đơn" color="from-blue-500 to-indigo-600" icon="📦" />
        <StatCard title="Tour đang mở" value={stats.openTours} unit={` / ${stats.totalTours}`} color="from-purple-500 to-pink-600" icon="🌍" />
        <StatCard title="Khách hàng" value={stats.totalUsers} unit=" người" color="from-orange-500 to-red-600" icon="👥" />
      </div>

      {/* ... Phần Biểu đồ giữ nguyên ... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-800 uppercase text-sm tracking-widest">Xu hướng doanh thu</h3>
            <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold">VNĐ / Tháng</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip formatter={(value) => formatPrice(value)} />
                <Area type="monotone" dataKey="doanhThu" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 uppercase text-sm tracking-widest mb-6">Cơ cấu đơn hàng</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, unit, color, icon }) => (
  <div className={`bg-gradient-to-br ${color} p-6 rounded-3xl text-white shadow-xl shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300`}>
    <div className="flex justify-between items-start">
      <div className="text-white/80 text-xs font-black uppercase tracking-widest">{title}</div>
      <div className="text-2xl">{icon}</div>
    </div>
    <div className="text-2xl font-black mt-3">{value}<span className="text-sm font-medium opacity-80">{unit}</span></div>
  </div>
);

export default DashboardPage;