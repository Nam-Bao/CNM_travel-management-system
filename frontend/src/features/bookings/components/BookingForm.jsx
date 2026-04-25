import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BookingForm = ({ tour }) => {
  const navigate = useNavigate();
  const [guestSize, setGuestSize] = useState({ adult: 1, child: 0, infant: 0 });
  const [contactInfo, setContactInfo] = useState({
    full_name: "", // Đồng bộ với Model Backend
    phone: "",
    email: "",
  });

  if (!tour) return null;

  const today = new Date();
  const startDate = new Date(tour.start_date);
  const isTourEnded = today > startDate;

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

  // Tính toán giá an toàn
  const priceAdult = tour?.price?.adult || 0;
  const priceChild = tour?.price?.child || 0;
  const priceInfant = tour?.price?.infant || 0;

  const basePrice =
    priceAdult * guestSize.adult +
    priceChild * guestSize.child +
    priceInfant * guestSize.infant;

  const salePercentage = tour?.sale_percentage || 0;
  const finalPrice = basePrice * (1 - salePercentage / 100);

  const currentTotalSeats = guestSize.adult + guestSize.child + guestSize.infant;

  const handleUpdate = (type, op) => {
    setGuestSize((prev) => {
      let val = prev[type];
      if (op === "plus") {
        if (currentTotalSeats >= tour.available_seats) {
          alert(`Rất tiếc! Tour chỉ còn đúng ${tour.available_seats} chỗ trống.`);
          return prev;
        }
        val += 1;
      } else if (op === "minus") {
        val -= 1;
        if (type === "adult" && val < 1) val = 1;
        if (type !== "adult" && val < 0) val = 0;
      }
      return { ...prev, [type]: val };
    });
  };

  // ✅ HÀM DUY NHẤT ĐỂ ĐI TỚI TRANG BOOKING-TOUR
  const handleProceedToBooking = (e) => {
    e.preventDefault();

    // 1. Validate dữ liệu
    if (!contactInfo.full_name.trim() || !contactInfo.phone.trim() || !contactInfo.email.trim()) {
      return alert("Vui lòng điền đầy đủ thông tin liên hệ!");
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(contactInfo.phone.trim())) {
      return alert("Số điện thoại không hợp lệ!");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email.trim())) {
      return alert("Email không đúng định dạng!");
    }

    const token = localStorage.getItem('token');
    if (!token) {
        return alert("Vui lòng đăng nhập để đặt tour!");
    }

    // ✅ CHUYỂN TRANG VÀ TRUYỀN DATA
    navigate('/booking-tour', {
      state: {
        tour,
        guestSize,
        contactInfo,
        finalPrice
      }
    });
  };

  if (isTourEnded) {
    return (
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center shadow-inner">
        <span className="text-5xl block mb-4 opacity-50 grayscale">⏳</span>
        <h3 className="text-xl font-black text-gray-600 uppercase tracking-widest">Tour Đã Kết Thúc</h3>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Chuyến đi này đã khởi hành. Bạn không thể đặt vé nữa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <h4 className="font-bold">👥 Số lượng khách</h4>
      {["adult", "child", "infant"].map((t) => (
        <div key={t} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
          <span className="text-sm uppercase font-semibold">
            {t === "adult" ? "Người lớn" : t === "child" ? "Trẻ em" : "Em bé"}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleUpdate(t, "minus")}
              disabled={(t === 'adult' && guestSize.adult <= 1) || (t !== 'adult' && guestSize[t] <= 0)}
              className="w-8 h-8 border rounded-full bg-white font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >-</button>
            <span className="font-bold w-4 text-center">{guestSize[t]}</span>
            <button
              type="button"
              onClick={() => handleUpdate(t, "plus")}
              disabled={currentTotalSeats >= tour.available_seats}
              className="w-8 h-8 border rounded-full bg-white font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >+</button>
          </div>
        </div>
      ))}
      
      <div className="space-y-2 pt-2 border-t text-sm">
        <input
          className="w-full p-2 border rounded"
          placeholder="Họ tên *"
          value={contactInfo.full_name}
          onChange={(e) => setContactInfo({ ...contactInfo, full_name: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="SĐT *"
          value={contactInfo.phone}
          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Email *"
          value={contactInfo.email}
          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
        />
      </div>

      <div className="pt-4 border-t border-dashed">
        <div className="flex justify-between items-end mb-4">
          <span className="text-sm font-bold text-gray-500">Tạm tính:</span>
          <div className="text-right">
            {salePercentage > 0 && <p className="text-xs text-gray-400 line-through">{formatPrice(basePrice)}</p>}
            <p className="text-2xl font-black text-blue-700">{formatPrice(finalPrice)}</p>
          </div>
        </div>
        
        <button
          onClick={handleProceedToBooking}
          className="w-full py-3.5 bg-blue-600 text-white font-black text-lg rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          TIẾP TỤC ĐẶT CHỖ ➔
        </button>
      </div>
    </div>
  );
};

export default BookingForm;