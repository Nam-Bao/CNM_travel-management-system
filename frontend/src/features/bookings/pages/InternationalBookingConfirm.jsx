import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bookingApi from "../api/bookingApi";

const InternationalBookingConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tour, guestSize, contactInfo, tourPrice } = location.state || {};
  const [loading, setLoading] = useState(false);

  if (!tour || tour.tour_type !== "international") {
    navigate("/");
    return null;
  }

  const totalGuests = Number(guestSize?.adult || 0) + Number(guestSize?.child || 0) + Number(guestSize?.infant || 0);

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p || 0);

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      await bookingApi.createBooking({
        tourId: tour._id,
        selected_beds: [], // International tours không có ghế
        guest_size: guestSize,
        contact_info: contactInfo,
      });
      navigate("/my-bookings");
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi đặt tour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-sm border-x">
        {/* HEADER */}
        <div className="p-4 border-b">
          <button 
            onClick={() => navigate(-1)} 
            className="text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            ← Quay lại
          </button>
        </div>

        <div className="p-8">
          {/* PROGRESS */}
          <div className="flex justify-center items-center space-x-2 md:space-x-4 mb-10 text-xs md:text-sm">
            <div className="flex items-center text-blue-600 font-bold">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">1</span> Thông tin
            </div>
            <div className="w-8 md:w-16 h-px bg-blue-300"></div>
            <div className="flex items-center text-blue-600 font-bold">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">2</span> Xác nhận
            </div>
          </div>

          {/* TOUR INFO */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 mb-8">
            <h2 className="text-2xl font-black text-blue-900 mb-4">✈️ {tour.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-bold">Loại Tour</p>
                <p className="text-lg font-black text-blue-700">Quốc Tế</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold">Khởi Hành</p>
                <p className="text-lg font-black text-blue-700">
                  {new Date(tour.start_date).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold">Thời Gian</p>
                <p className="text-lg font-black text-blue-700">{tour.duration}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold">Chỗ Trống</p>
                <p className="text-lg font-black text-blue-700">{tour.available_seats} chỗ</p>
              </div>
            </div>
          </div>

          {/* THÔNG TIN KHÁCH */}
          <div className="bg-white p-6 border rounded-2xl mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">👥 Thông tin khách hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Họ tên:</span>
                <span className="font-bold text-gray-800">{contactInfo.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số điện thoại:</span>
                <span className="font-bold text-gray-800">{contactInfo.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-bold text-gray-800">{contactInfo.email}</span>
              </div>
            </div>
          </div>

          {/* THÔNG TIN KHÁCH */}
          <div className="bg-white p-6 border rounded-2xl mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">📋 Danh sách khách</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">👨 Người lớn:</span>
                <span className="font-bold text-gray-800">{guestSize.adult}</span>
              </div>
              {guestSize.child > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">👧 Trẻ em (2-11 tuổi):</span>
                  <span className="font-bold text-gray-800">{guestSize.child}</span>
                </div>
              )}
              {guestSize.infant > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">👶 Em bé (dưới 2 tuổi):</span>
                  <span className="font-bold text-gray-800">{guestSize.infant}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
                <span>Tổng khách:</span>
                <span>{totalGuests} người</span>
              </div>
            </div>
          </div>

          {/* THÔNG TIN GIÁ */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border border-orange-200 rounded-2xl mb-8">
            <h3 className="text-lg font-bold text-orange-900 mb-4">💰 Chi tiết giá</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Giá tour:</span>
                <span className="font-bold text-gray-800">{formatPrice(tourPrice)}</span>
              </div>
              <div className="border-t border-orange-200 pt-3 flex justify-between">
                <span className="font-bold text-orange-900">Tổng tiền:</span>
                <span className="text-3xl font-black text-orange-600">{formatPrice(tourPrice)}</span>
              </div>
            </div>
          </div>

          {/* CÁC NÚT HÀNH ĐỘNG */}
          <div className="flex gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition"
            >
              ← QUAY LẠI
            </button>
            <button 
              onClick={handleConfirmBooking}
              disabled={loading}
              className="flex-1 py-4 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT TOUR ✅"}
            </button>
          </div>

          {/* THÔNG BÁO */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
            <p className="font-bold mb-1">📌 Lưu ý quan trọng:</p>
            <p>
              Sau khi xác nhận, bạn sẽ nhận được email xác nhận booking. Vé máy bay sẽ được gửi qua email hoặc điện thoại từ công ty du lịch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalBookingConfirm;
