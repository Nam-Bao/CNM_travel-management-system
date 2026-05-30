import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ManageBookings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [tourStatusFilter, setTourStatusFilter] = useState("ALL");
  const [showDeadlineOnly, setShowDeadlineOnly] = useState(location.state?.filterDeadline || false);

  // 🔥 THÊM STATE QUẢN LÝ MODAL
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchAllBookings = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.data || res.data || []);
    } catch (err) {
      setError("Không thể tải dữ liệu đơn đặt tour. Vui lòng kiểm tra quyền Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const handleMarkAsFullyPaid = async (bookingId) => {
    if (window.confirm("Xác nhận khách hàng đã thanh toán 50% số tiền còn lại?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`http://localhost:5000/api/bookings/${bookingId}/complete-payment`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("✅ Cập nhật thanh toán 100% thành công!");
        setSelectedBooking(null); // Đóng modal sau khi thao tác
        fetchAllBookings(); 
      } catch (err) {
        alert("Lỗi khi cập nhật thanh toán!");
      }
    }
  };

  const handleCancelUnpaidBooking = async (bookingId) => {
    if (window.confirm("⚠️ CẢNH BÁO: Hủy đơn hàng này do khách không thanh toán phần còn lại?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("✅ Đã hủy đơn hàng và hoàn trả lại chỗ trống thành công!");
        setSelectedBooking(null); // Đóng modal sau khi thao tác
        fetchAllBookings(); 
      } catch (err) {
        alert("Lỗi khi hủy đơn hàng!");
      }
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getBookingStatus = (tour) => {
    if (!tour || !tour.start_date) return "UNKNOWN";
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startDate = new Date(tour.start_date); startDate.setHours(0, 0, 0, 0);
    const daysMatch = tour.duration ? tour.duration.match(/\d+/) : null;
    const days = daysMatch ? parseInt(daysMatch[0], 10) : 1;
    const endDate = new Date(startDate); endDate.setDate(startDate.getDate() + days - 1); endDate.setHours(0, 0, 0, 0);

    if (today < startDate) return "PENDING";
    if (today >= startDate && today <= endDate) return "ONGOING";
    if (today > endDate) return "COMPLETED";
  };

  const getDeadlineInfo = (startDateString) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const startDate = new Date(startDateString); startDate.setHours(0,0,0,0);
    const diffDaysToTour = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysToDeadline = diffDaysToTour - 7;
    return { diffDaysToTour, daysToDeadline };
  };

  const renderStatusBadge = (booking) => {
    if (booking.status === "CANCELED" || booking.status === "cancelled") {
      return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Đã Hủy</span>;
    }
    const tourStatus = getBookingStatus(booking.tour);
    switch (tourStatus) {
      case "PENDING": return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase">Chưa đi</span>;
      case "ONGOING": return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-black uppercase">Đang đi</span>;
      case "COMPLETED": return <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-black uppercase">Hoàn thành</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-black uppercase">N/A</span>;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = booking._id.toLowerCase().includes(searchLower) || (booking.tour?.title?.toLowerCase() || "").includes(searchLower) || (booking.contact_info?.phone || "").includes(searchLower);

    if (showDeadlineOnly) {
        if (booking.status === "CANCELED" || booking.payment_percent !== 50) return false;
        if (!booking.tour?.start_date) return false;
        const { diffDaysToTour } = getDeadlineInfo(booking.tour.start_date);
        return matchSearch && (diffDaysToTour >= 0 && diffDaysToTour <= 10);
    }

    let matchPayment = true;
    if (paymentFilter !== "ALL") {
      if (paymentFilter === "PAID_100") matchPayment = booking.payment_percent === 100;
      else if (paymentFilter === "PAID_50") matchPayment = booking.payment_percent === 50;
    }

    let matchTourStatus = true;
    if (tourStatusFilter !== "ALL") {
      matchTourStatus = getBookingStatus(booking.tour) === tourStatusFilter;
    }

    return matchSearch && matchPayment && matchTourStatus;
  });

  if (loading) return <div className="p-20 text-center text-blue-600 font-bold">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800">📦 Quản lý Đơn đặt Tour</h1>
              <p className="text-sm text-gray-500 mt-1">Tìm thấy <span className="text-blue-600 font-bold">{filteredBookings.length}</span> đơn hàng.</p>
            </div>
          </div>

          {showDeadlineOnly && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex justify-between items-center animate-fade-in">
              <div className="flex items-center gap-2">
                 <span className="animate-pulse text-lg">⚠️</span>
                 <span className="font-bold">Đang hiển thị danh sách Sắp Đến Hạn đóng 50% còn lại.</span>
              </div>
              <button onClick={() => { setShowDeadlineOnly(false); navigate(location.pathname, { replace: true }); }} className="bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition">
                ✖ Tắt bộ lọc
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5">🔍</span>
              <input type="text" placeholder="Tìm mã đơn, tên khách..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none text-sm" />
            </div>
            <div className="w-full md:w-56">
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm bg-white cursor-pointer font-bold">
                <option value="ALL">Trạng thái thanh toán</option>
                <option value="PAID_100">Đã thanh toán 100%</option>
                <option value="PAID_50">Đã cọc 50%</option>
              </select>
            </div>
            <div className="w-full md:w-56">
              <select value={tourStatusFilter} onChange={(e) => setTourStatusFilter(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm bg-white cursor-pointer font-bold">
                <option value="ALL">Trạng thái chuyến đi</option>
                <option value="PENDING">Chưa khởi hành</option>
                <option value="ONGOING">Đang thực hiện</option>
                <option value="COMPLETED">Đã hoàn thành</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🔥 BẢNG TỔNG QUAN RÚT GỌN 🔥 */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3 w-[15%]">Mã Đơn</th>
                <th className="px-4 py-3 w-[25%]">Khách Hàng</th>
                <th className="px-4 py-3 w-[30%]">Tên Tour</th>
                <th className="px-4 py-3 w-[15%]">Tổng Tiền</th>
                <th className="px-4 py-3 text-center w-[15%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => {
                const isDeposit = booking.payment_percent === 50 && booking.status !== "CANCELED";
                const { daysToDeadline } = isDeposit && booking.tour ? getDeadlineInfo(booking.tour.start_date) : { daysToDeadline: null };

                return (
                  <tr key={booking._id} className="hover:bg-blue-50 transition cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-800 text-xs">#{booking._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(booking.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-800 truncate">{booking.contact_info?.full_name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">📞 {booking.contact_info?.phone}</p>
                    </td>
                    <td className="px-4 py-3 pr-4">
                      <p className="font-bold text-blue-700 truncate">{booking.tour?.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {renderStatusBadge(booking)}
                        {isDeposit && daysToDeadline <= 0 && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold animate-pulse">Quá hạn</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-gray-800">{formatPrice(booking.total_price)}</p>
                      <p className={`text-[10px] font-bold uppercase mt-0.5 ${isDeposit ? 'text-orange-500' : booking.status === 'CANCELED' ? 'text-red-500' : 'text-green-500'}`}>
                        {booking.status === 'CANCELED' ? 'Đã hủy' : isDeposit ? 'Đã cọc 50%' : 'Đã thu 100%'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 MODAL CHI TIẾT ĐƠN HÀNG 🔥 */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
            
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-black text-gray-800">
                  Chi tiết đơn hàng <span className="text-blue-600">#{selectedBooking._id.slice(-6).toUpperCase()}</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">Ngày đặt: {formatDate(selectedBooking.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 w-8 h-8 rounded-full flex justify-center items-center font-bold text-xl transition">
                ✕
              </button>
            </div>

            {/* Nội dung Modal */}
            <div className="p-6 space-y-6">
              
              {/* Cảnh báo nợ (Nếu có) */}
              {selectedBooking.payment_percent === 50 && selectedBooking.status !== "CANCELED" && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-bold text-orange-800">Khách hàng chưa thanh toán đủ tiền!</h3>
                    <p className="text-sm text-orange-700 mt-1">
                      Hạn chót đóng tiền: {(() => {
                        const { daysToDeadline } = getDeadlineInfo(selectedBooking.tour?.start_date);
                        if (daysToDeadline < 0) return <span className="font-black text-red-600">Đã quá hạn {Math.abs(daysToDeadline)} ngày</span>;
                        if (daysToDeadline === 0) return <span className="font-black text-orange-600">Hôm nay</span>;
                        return <span className="font-bold">Còn {daysToDeadline} ngày</span>;
                      })()}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột 1: Thông tin khách & Thanh toán */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h3 className="font-black text-gray-700 mb-3 uppercase text-xs tracking-wider">👤 Thông tin người đặt</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Họ và tên:</span> <span className="font-bold text-gray-800">{selectedBooking.contact_info?.full_name}</span></p>
                      <p><span className="text-gray-500">Điện thoại:</span> <span className="font-bold text-gray-800">{selectedBooking.contact_info?.phone}</span></p>
                      <p><span className="text-gray-500">Email:</span> <span className="font-bold text-gray-800">{selectedBooking.contact_info?.email}</span></p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-black text-blue-800 mb-3 uppercase text-xs tracking-wider">💳 Lịch sử thanh toán</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b border-blue-200/50 pb-2">
                        <span className="text-blue-600">Tổng tiền Tour:</span>
                        <span className="font-black text-lg text-blue-700">{formatPrice(selectedBooking.total_price)}</span>
                      </div>
                      <p><span className="text-gray-600">Trạng thái nộp:</span> <span className={`font-black uppercase ${selectedBooking.payment_percent === 50 ? 'text-orange-600' : 'text-green-600'}`}>{selectedBooking.payment_percent === 50 ? 'Đã cọc 50%' : 'Đã thanh toán đủ 100%'}</span></p>
                      <p><span className="text-gray-600">Hình thức CK:</span> <span className="font-bold">{selectedBooking.payment_method === 'CASH' ? 'Tiền mặt' : selectedBooking.payment_method === 'VIETQR' ? 'VietQR' : 'VNPay'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Cột 2: Thông tin Tour */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="font-black text-gray-700 mb-3 uppercase text-xs tracking-wider">🗺️ Thông tin Chuyến đi</h3>
                  <div className="space-y-3 text-sm">
                    <p className="font-bold text-blue-700 text-base line-clamp-2">{selectedBooking.tour?.title}</p>
                    <p><span className="text-gray-500">Khởi hành:</span> <span className="font-bold text-gray-800">{new Date(selectedBooking.tour?.start_date).toLocaleDateString('vi-VN')}</span></p>
                    <div className="border-t border-dashed pt-3 mt-3">
                      <p className="text-gray-500 mb-1">Số lượng khách:</p>
                      <ul className="list-disc list-inside font-bold text-gray-800 ml-2">
                        {selectedBooking.guest_size?.adult > 0 && <li>{selectedBooking.guest_size.adult} Người lớn</li>}
                        {selectedBooking.guest_size?.child > 0 && <li>{selectedBooking.guest_size.child} Trẻ em</li>}
                        {selectedBooking.guest_size?.infant > 0 && <li>{selectedBooking.guest_size.infant} Em bé</li>}
                      </ul>
                    </div>
                    <div className="bg-white border p-3 rounded-lg mt-3">
                      <span className="text-gray-500 text-xs block mb-1">Vị trí ghế đã chọn:</span>
                      <span className="font-black text-blue-600 text-lg">
                        {selectedBooking.selected_beds?.length > 0 ? selectedBooking.selected_beds.join(", ") : "Chưa chọn (Hãng bay tự xếp)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal: Các nút thao tác */}
            <div className="bg-gray-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              {selectedBooking.payment_percent === 50 && selectedBooking.status !== "CANCELED" && (
                <>
                  <button onClick={() => handleCancelUnpaidBooking(selectedBooking._id)} className="bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold px-5 py-2.5 rounded-lg text-sm transition">
                    ✖ Hủy đơn (Khách bỏ cọc)
                  </button>
                  <button onClick={() => handleMarkAsFullyPaid(selectedBooking._id)} className="bg-green-600 text-white hover:bg-green-700 shadow-md font-bold px-5 py-2.5 rounded-lg text-sm transition">
                    ✅ Xác nhận thu đủ 100%
                  </button>
                </>
              )}
              <button onClick={() => setSelectedBooking(null)} className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold px-5 py-2.5 rounded-lg text-sm transition ml-2">
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;