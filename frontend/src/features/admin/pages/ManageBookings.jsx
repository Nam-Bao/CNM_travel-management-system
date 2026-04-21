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
        "Không thể tải dữ liệu đơn đặt tour. Vui lòng kiểm tra quyền Admin.",
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
    // Kiểm tra đa dạng các kiểu giá trị "Đã thanh toán" từ Database
    const isPaid = ["Đã thanh toán", "paid", "PAID"].includes(booking.status);

    if (isPaid) {
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-200 shadow-sm">
          ✅ Đã thanh toán
        </span>
      );
    }

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

  // ✅ LOGIC LỌC ĐÃ ĐƯỢC SỬA LỖI
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      booking._id.toLowerCase().includes(searchLower) ||
      (booking.tour?.title?.toLowerCase() || "").includes(searchLower);

    let matchStatus = true;
    if (statusFilter !== "ALL") {
      if (statusFilter === "PAID") {
        // Chấp nhận mọi kiểu chữ "paid" từ database gửi về
        matchStatus = ["Đã thanh toán", "paid", "PAID"].includes(
          booking.status,
        );
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
                <option value="ALL">📋 Tất cả trạng thái</option>
                <option value="PENDING">⏳ Chưa khởi hành</option>
                <option value="ONGOING">🔥 Đang thực hiện</option>
                <option value="COMPLETED">🏁 Đã hoàn thành</option>
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
                <th className="px-6 py-4">Tên Tour</th>
                <th className="px-6 py-4 text-center">Số Vé</th>
                <th className="px-6 py-4 text-right">Tổng Tiền / Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
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
                    <p className="text-[10px] text-gray-500">
                      📞 {booking.contact_info?.phone}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-blue-700 line-clamp-1">
                      {booking.tour?.title}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg font-black italic">
                      {(booking.guest_size?.adult || 0) +
                        (booking.guest_size?.child || 0)}{" "}
                      vé
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-base font-black text-green-600">
                      {formatPrice(booking.total_price)}
                    </p>
                    <div className="mt-1">{renderStatusBadge(booking)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
