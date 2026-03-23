import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // States cho Tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchAllBookings = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.data || res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách booking:", err);
      setError("Không thể tải dữ liệu đơn đặt tour. Vui lòng kiểm tra quyền Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // Hàm xác định trạng thái Tour
  const getBookingStatus = (tour) => {
    if (!tour || !tour.start_date) return "UNKNOWN";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(tour.start_date);
    startDate.setHours(0, 0, 0, 0);

    // Bóc tách con số từ chuỗi "3 ngày 2 đêm" -> lấy số 3
    const daysMatch = tour.duration ? tour.duration.match(/\d+/) : null;
    const days = daysMatch ? parseInt(daysMatch[0], 10) : 1;

    // Tính ngày kết thúc
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days - 1);
    endDate.setHours(0, 0, 0, 0);

    if (today < startDate) return "PENDING"; // Chưa khởi hành
    if (today >= startDate && today <= endDate) return "ONGOING"; // Đang thực hiện
    if (today > endDate) return "COMPLETED"; // Đã hoàn thành
  };

  // Render UI cho Badge Trạng thái
  const StatusBadge = ({ status }) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Chưa khởi hành</span>;
      case "ONGOING":
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">🔥 Đang thực hiện</span>;
      case "COMPLETED":
        return <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Đã hoàn thành</span>;
      default:
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Lỗi dữ liệu</span>;
    }
  };

  // LOGIC TÌM KIẾM & LỌC
  const filteredBookings = bookings.filter((booking) => {
    // 1. Tìm theo Mã đơn hoặc Tên Tour
    const searchLower = searchTerm.toLowerCase();
    const matchId = booking._id.toLowerCase().includes(searchLower);
    const matchTourName = booking.tour?.title?.toLowerCase().includes(searchLower) || false;
    const matchSearch = matchId || matchTourName;

    // 2. Lọc theo trạng thái
    const status = getBookingStatus(booking.tour);
    let matchStatus = true;
    if (statusFilter !== "ALL") {
      matchStatus = status === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-600 font-bold">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Đang tải dữ liệu hệ thống...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header (Đã gỡ nút Quay lại theo yêu cầu) */}
        <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border">
          <h1 className="text-2xl font-black text-gray-800">📦 Quản lý Đơn đặt Tour</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Hiển thị, tìm kiếm và phân loại các đơn đặt vé trên hệ thống Traveloke.
          </p>

          {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Tìm theo Mã đơn (VD: b115dc) hoặc Tên Tour..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div className="w-full md:w-64">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white cursor-pointer"
              >
                <option value="ALL">📋 Tất cả trạng thái</option>
                <option value="PENDING">⏳ Chưa khởi hành</option>
                <option value="ONGOING">🔥 Đang thực hiện</option>
                <option value="COMPLETED">✅ Đã hoàn thành</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 font-bold shadow-sm">
            {error}
          </div>
        )}

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-blue-600 text-white font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Mã Đơn / Ngày Đặt</th>
                  <th className="px-6 py-4">Thông tin Khách</th>
                  <th className="px-6 py-4">Tên Tour & Lịch trình</th>
                  <th className="px-6 py-4 text-center">Số Vé</th>
                  <th className="px-6 py-4 text-right">Tổng Tiền / Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-3 opacity-50">🏜️</div>
                      <p className="font-bold">Không tìm thấy đơn đặt tour nào phù hợp.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    // YÊU CẦU 1: Tính tổng số vé
                    const totalTickets = (booking.guest_size?.adult || 0) + (booking.guest_size?.child || 0) + (booking.guest_size?.infant || 0);
                    const status = getBookingStatus(booking.tour);

                    return (
                      <tr key={booking._id} className="hover:bg-blue-50 transition">
                        {/* Cột 1: Mã đơn & Ngày đặt */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-gray-800 text-xs uppercase" title={booking._id}>
                            #{booking._id.slice(-6)}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {formatDate(booking.createdAt)}
                          </p>
                        </td>

                        {/* Cột 2: Khách hàng */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800">
                            {booking.contact_info?.full_name || booking.user?.username || "Khách lạ"}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">📞 {booking.contact_info?.phone || "N/A"}</p>
                        </td>

                        {/* Cột 3: Tên Tour */}
                        <td className="px-6 py-4 max-w-xs">
                          {booking.tour ? (
                            <>
                              <p className="font-bold text-blue-700 line-clamp-2">
                                {booking.tour.title}
                              </p>
                              <p className="text-[11px] text-gray-500 font-medium mt-1">
                                Khởi hành: <span className="text-gray-800 font-bold">{new Date(booking.tour.start_date).toLocaleDateString("vi-VN")}</span>
                              </p>
                            </>
                          ) : (
                            <span className="text-red-500 italic font-medium">Tour đã bị xóa khỏi hệ thống</span>
                          )}
                        </td>

                        {/* Cột 4: Số lượng (Đã đổi thành Tổng số vé) */}
                        <td className="px-6 py-4 text-center">
                          <div className="inline-block bg-gray-100 border px-4 py-1.5 rounded-lg text-sm font-black text-gray-700 shadow-inner">
                            {totalTickets} vé
                          </div>
                        </td>

                        {/* Cột 5: Tổng tiền & Trạng thái */}
                        <td className="px-6 py-4 text-right flex flex-col items-end justify-center gap-2">
                          {booking.status === 'CANCELED' ? (
                            <>
                              <p className="text-base font-black text-gray-400 line-through">{formatPrice(booking.total_price)}</p>
                              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Đã Hủy (Hoàn {booking.refund_percentage}%)</span>
                            </>
                          ) : (
                            <>
                              <p className="text-base font-black text-green-600">{formatPrice(booking.total_price)}</p>
                              <StatusBadge status={status} /> {/* Status badge mà mình đã làm trước đây */}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ManageBookings;