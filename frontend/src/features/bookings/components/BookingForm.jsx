import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BookingForm = ({ tour }) => {
  const navigate = useNavigate();
  const [guestSize, setGuestSize] = useState({ adult: 1, child: 0, infant: 0 });
  const [contactInfo, setContactInfo] = useState({
    fullName: "", // Đổi từ full_name thành fullName cho khớp với CheckoutPage
    phone: "",
    email: "",
  });

  if (!tour) return null;

  const today = new Date();
  const startDate = new Date(tour.start_date);
  const isTourEnded = today > startDate;

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

  const basePrice =
    (tour?.price?.adult || 0) * guestSize.adult +
    (tour?.price?.child || 0) * guestSize.child +
    (tour?.price?.infant || 0) * guestSize.infant;

  const currentTotalSeats = guestSize.adult + guestSize.child + guestSize.infant;

  const handleUpdate = (type, op) => {
    setGuestSize((prev) => {
      let val = prev[type];
      if (op === "plus") {
        if (currentTotalSeats >= tour.available_seats) {
          alert(`Rất tiếc! Tour chỉ còn đúng ${tour.available_seats} chỗ trống.`);
          return prev;
        }
      }
      return { ...prev, [type]: val };
    });
  };

  // ✅ LOGIC MỚI: KIỂM TRA LỖI (VALIDATE) VÀ CHUYỂN TRANG
  const handleProceedToCheckout = (e) => {
    e.preventDefault();

    // 1. Kiểm tra rỗng
    if (!contactInfo.full_name.trim() || !contactInfo.phone.trim() || !contactInfo.email.trim()) {
      return alert("Vui lòng điền đầy đủ thông tin liên hệ!");
    }

    // 2. Validate Số điện thoại (Định dạng VN: 10 số, bắt đầu bằng 03,05,07,08,09)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(contactInfo.phone.trim())) {
      return alert("Số điện thoại bắt đầu bằng (03,05,07,08,09)! Vui lòng nhập đúng.");
    }

    // 3. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email.trim())) {
      return alert("Địa chỉ Email không hợp lệ!");
    }

    // 4. Kiểm tra sức chứa
    if (currentTotalSeats > tour.available_seats) {
        return alert(`Số lượng khách vượt quá số chỗ còn trống (${tour.available_seats} vé).`);
    }

    const token = localStorage.getItem('token');
    if (!token) {
        return alert("Vui lòng đăng nhập để tiến hành đặt tour!");
    }

    // ✅ Gói dữ liệu chuyển sang trang Xác nhận thanh toán
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
          Chuyến đi này đã khởi hành. Bạn không thể đặt vé nữa.<br />Vui lòng chọn một lịch trình khác nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-700 uppercase text-[10px] tracking-widest border-b pb-2">
        👥 Chọn số lượng khách
      </h4>

      {["adult", "child", "infant"].map((t) => (
        <div key={t} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
          <span className="text-sm uppercase font-semibold">
            {t === "adult" ? "Người lớn" : t === "child" ? "Trẻ em" : "Em bé"}
          </span>
          <div className="flex items-center gap-4">
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

      <div className="space-y-3 pt-2">
        <input
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Họ tên *"
          value={contactInfo.full_name}
          onChange={(e) => setContactInfo({ ...contactInfo, full_name: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Số điện thoại *"
          value={contactInfo.phone}
          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Email liên hệ *"
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
          onClick={handleProceedToCheckout}
          disabled={currentTotalSeats > tour.available_seats}
          className="w-full py-3.5 bg-blue-600 text-white font-black text-lg rounded-xl active:scale-95 transition-all shadow-lg hover:bg-blue-700"
        >
          TIẾP TỤC THANH TOÁN ➔
        </button>
      </div>

      <button
        onClick={handleGoToCheckout}
        disabled={
          !contactInfo.fullName || !contactInfo.phone || !contactInfo.email
        }
        className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-100 hover:bg-orange-600 disabled:bg-gray-200 disabled:shadow-none transition-all uppercase italic tracking-widest active:scale-95"
      >
        Xác nhận đặt tour
      </button>

      <p className="text-[9px] text-gray-400 text-center italic font-medium leading-relaxed">
        * Nhân viên Traveloke sẽ liên hệ xác nhận trong vòng 15 phút sau khi
        đặt.
      </p>
    </div>
  );
};

export default BookingForm;
