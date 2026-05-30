import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const HotelBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotel, room } = location.state || {};

  // Mặc định chọn ở 1 đêm (từ hôm nay đến ngày mai)
  const [dates, setDates] = useState({
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });

  if (!hotel || !room) {
    navigate("/hotels");
    return null;
  }

  // Tính số đêm
  const diffTime = Math.abs(new Date(dates.checkOut) - new Date(dates.checkIn));
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = room.price * nights;

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p || 0);

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Vui lòng đăng nhập để đặt phòng!");

      const payload = {
        hotelId: hotel._id,
        roomType: room.room_type,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        totalPrice: totalPrice,
      };

      // Gọi API lưu vào DB (Mình sẽ viết API này ở bước 2)
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/hotel-bookings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("🎉 Chúc mừng Thịnh! Đã đặt phòng khách sạn thành công.");
      navigate("/my-bookings");
    } catch (err) {
      alert(
        "Lỗi khi đặt phòng: " + (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CỘT TRÁI: THÔNG TIN PHÒNG */}
        <div className="bg-white p-6 rounded-3xl shadow-sm h-fit">
          <h2 className="text-2xl font-black mb-4">Xác nhận đặt phòng</h2>
          <img
            src={hotel.images?.[0]}
            className="rounded-2xl h-40 w-full object-cover mb-4"
          />
          <h3 className="font-bold text-xl">{hotel.name}</h3>
          <p className="text-blue-600 font-bold mb-4">{room.room_type}</p>

          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">
                Ngày nhận phòng
              </label>
              <input
                type="date"
                className="w-full p-3 border rounded-xl mt-1"
                value={dates.checkIn}
                onChange={(e) =>
                  setDates({ ...dates, checkIn: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">
                Ngày trả phòng
              </label>
              <input
                type="date"
                className="w-full p-3 border rounded-xl mt-1"
                value={dates.checkOut}
                onChange={(e) =>
                  setDates({ ...dates, checkOut: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TỔNG TIỀN */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-orange-500 h-fit">
          <h3 className="font-bold text-lg mb-4 text-gray-800">
            Chi tiết hóa đơn
          </h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Giá phòng / đêm:</span>
            <span className="font-bold">{formatPrice(room.price)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-500">Số đêm lưu trú:</span>
            <span className="font-bold text-blue-600">{nights} đêm</span>
          </div>
          <div className="border-t pt-4 flex justify-between items-end">
            <span className="font-black text-gray-800">TỔNG CỘNG:</span>
            <span className="text-3xl font-black text-orange-600">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-700 text-white font-black py-4 rounded-2xl mt-8 hover:bg-blue-800 transition-all active:scale-95"
          >
            HOÀN TẤT ĐẶT PHÒNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelBookingPage;
