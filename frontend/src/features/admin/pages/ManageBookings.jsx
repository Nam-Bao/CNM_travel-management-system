import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      setError(
        "Không thể tải dữ liệu đơn đặt tour. Vui lòng kiểm tra quyền Admin."
      );
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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBookingStatus = (tour) => {
    if (!tour || !tour.start_date) return "UNKNOWN";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(tour.start_date);
    startDate.setHours(0, 0, 0, 0);
    const daysMatch = tour.duration ? tour.duration.match(/\d+/) : null;
    const days = daysMatch ? parseInt(daysMatch[0], 10) : 1;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days - 1);
    endDate.setHours(0, 0, 0, 0);

    if (today < startDate) return "PENDING";
    if (today >= startDate && today <= endDate) return "ONGOING";
    if (today > endDate) return "COMPLETED";
  };

  const renderStatusBadge = (booking) => {
    if (booking.status === "CANCELED" || booking.status === "cancelled") {
      return (
        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
          Đã Hủy
        </span>
      );
    }

    const tourStatus = getBookingStatus(booking.tour);
    switch (tourStatus) {
      case "PENDING":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            Chưa khởi hành
          </span>
        );
      case "ONGOING":
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
            🔥 Đang thực hiện
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            Đã hoàn thành
          </span>
        );
      default:
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            Lỗi dữ liệu
          </span>
        );
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      booking._id.toLowerCase().includes(searchLower) ||
      (booking.tour?.title?.toLowerCase() || "").includes(searchLower);

    let matchStatus = true;
    if (statusFilter !== "ALL") {
      if (statusFilter === "PAID_100") {
        matchStatus = booking.payment_percent === 100;
      } else if (statusFilter === "PAID_50") {
        matchStatus = booking.payment_percent === 50;
      } else {
        matchStatus = getBookingStatus(booking.tour) === statusFilter;
      }
    }
    return matchSearch && matchStatus;
  });

  if (loading)
    return (
      <div className="p-20 text-center text-blue-600 font-bold">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800">
                📦 Quản lý Đơn đặt Tour
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tìm thấy{" "}
                <span className="text-blue-600 font-bold">
                  {filteredBookings.length}
                </span>{" "}
                đơn hàng.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5">🔍</span>
              <input
                type="text"
                placeholder="Tìm mã đơn hoặc tên tour..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none text-sm"
              />
            </div>
            <div className="w-full md:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm bg-white cursor-pointer font-bold"
              >
                <option value="ALL">Trạng thái thanh toán</option>
                <option value="PAID_100">Đã thanh toán 100%</option>
                <option value="PAID_50">Đã cọc 50%</option>
              </select>
            </div>
            <div className="w-full md:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm bg-white cursor-pointer font-bold"
              >
                <option value="ALL">Trạng thái đặt chỗ</option>
                <option value="PENDING">Chưa khởi hành</option>
                <option value="ONGOING">Đang thực hiện</option>
                <option value="COMPLETED">Đã hoàn thành</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-600 text-white font-bold uppercase text-[11px]">
              <tr>
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Thông tin Khách</th>
                <th className="px-6 py-4 w-1/4">Tên Tour</th>
                <th className="px-6 py-4">Số Vé & Vị trí</th>
                <th className="px-6 py-4 text-right">Tổng Tiền / Thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => {
                const { adult, child, infant } = booking.guest_size || { adult: 0, child: 0, infant: 0 };
                const totalTickets = (adult || 0) + (child || 0) + (infant || 0);

                return (
                  <tr key={booking._id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 text-xs">
                        #{booking._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatDate(booking.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">
                        {booking.contact_info?.full_name || "N/A"}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        📞 {booking.contact_info?.phone}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        ✉️ {booking.contact_info?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-700 line-clamp-2">
                        {booking.tour?.title}
                      </p>
                    </td>
                    {/* CỘT SỐ VÉ & VỊ TRÍ GHẾ */}
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-3 py-1 rounded-lg font-black italic text-gray-700 inline-block mb-2">
                        {totalTickets} vé
                      </span>
                      <div className="text-[11px] text-gray-600 space-y-0.5 mb-2">
                        {adult > 0 && <p>• {adult} Người lớn</p>}
                        {child > 0 && <p>• {child} Trẻ em</p>}
                        {infant > 0 && <p>• {infant} Em bé</p>}
                      </div>
                      
                      {/* BỔ SUNG VỊ TRÍ GHẾ CHO ADMIN */}
                      <div className="bg-blue-50 border border-blue-100 px-2 py-1.5 rounded inline-block">
                         <p className="text-[10px] font-bold text-blue-700">
                           💺 Ghế: {booking.selected_beds && booking.selected_beds.length > 0 
                             ? booking.selected_beds.join(", ") 
                             : "Hãng bay sắp xếp"}
                         </p>
                      </div>
                    </td>
                    {/* CỘT TỔNG TIỀN & THANH TOÁN */}
                    <td className="px-6 py-4 text-right">
                      <p className="text-base font-black text-green-600">
                        {formatPrice(booking.total_price)}
                      </p>
                      
                      <div className="text-[10px] mt-1 space-y-1">
                        <p className={`font-bold uppercase ${booking.payment_percent === 50 ? 'text-orange-500' : 'text-blue-500'}`}>
                           {booking.payment_percent === 50 ? "Đã cọc 50%" : "Đã thanh toán 100%"}
                        </p>
                        <p className="text-gray-500">
                          Hình thức: {booking.payment_method === 'CASH' ? 'Tiền mặt' : 'VNPay'}
                        </p>
                      </div>

                      <div className="mt-2">{renderStatusBadge(booking)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;