import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BookingForm = ({ tour, savedData }) => {
  const navigate = useNavigate();

  // 1. KHỞI TẠO STATE TRỰC TIẾP TỪ SAVEDATA
  const [guestSize, setGuestSize] = useState({
    adult: Number(savedData?.guestSize?.adult || 1),
    child: Number(savedData?.guestSize?.child || 0),
    infant: Number(savedData?.guestSize?.infant || 0),
  });

  const [contactInfo, setContactInfo] = useState({
    full_name: savedData?.contactInfo?.full_name || "",
    phone: savedData?.contactInfo?.phone || "",
    email: savedData?.contactInfo?.email || "",
  });

  if (!tour) return null;

  // 🔥 ĐÃ FIX LỖI: Đổi `tour_type` thành `location_type` cho khớp 100% với Database của bạn
  const isInternational = tour?.location_type?.toLowerCase()?.trim() === "international";

  const today = new Date();
  const startDate = new Date(tour.start_date);
  const isTourEnded = today > startDate;

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p || 0);

  // 2. TÍNH TOÁN GIÁ TIỀN CHUẨN XÁC
  const priceAdult = Number(tour?.price?.adult || 0);
  const priceChild = Number(tour?.price?.child || 0);
  const priceInfant = Number(tour?.price?.infant || 0);

  const basePrice =
    priceAdult * guestSize.adult +
    priceChild * guestSize.child +
    priceInfant * guestSize.infant;

  const salePercentage = Number(tour?.sale_percentage || 0);
  const finalPrice = basePrice * (1 - salePercentage / 100);

  // 3. XỬ LÝ CHỖ TRỐNG TỰ ĐỘNG BẢO VỆ
  const dbSeats = Number(tour?.available_seats || 0);
  const availableSeats = dbSeats > 0 ? dbSeats : 100;
  
  const currentTotalSeats = guestSize.adult + guestSize.child + guestSize.infant;

  // 4. HÀM TĂNG/GIẢM BẢO MẬT BẰNG PREV STATE
  const handleIncrease = (type) => {
    setGuestSize((prev) => {
      let currentTotal = prev.adult + prev.child + prev.infant;
      if (currentTotal >= availableSeats) {
        alert(`Rất tiếc! Tour chỉ còn ${availableSeats} chỗ trống.`);
        return prev;
      }
      return { ...prev, [type]: prev[type] + 1 };
    });
  };

  const handleDecrease = (type) => {
    setGuestSize((prev) => {
      let val = prev[type] - 1;
      if (type === "adult" && val < 1) val = 1;
      if (type !== "adult" && val < 0) val = 0;
      return { ...prev, [type]: val };
    });
  };

  const handleProceedToBooking = (e) => {
    e.preventDefault();

    if (!contactInfo.full_name.trim() || !contactInfo.phone.trim() || !contactInfo.email.trim()) {
      return alert("Vui lòng điền đầy đủ thông tin liên hệ!");
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(contactInfo.phone.trim())) {
      return alert("Số điện thoại không hợp lệ! Vui lòng nhập SĐT Việt Nam 10 số.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email.trim())) {
      return alert("Email không đúng định dạng!");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return alert("Vui lòng đăng nhập trước khi đặt tour!");
    }

    // ĐIỀU HƯỚNG BẰNG BIẾN isInternational ĐÃ ĐƯỢC FIX
    if (isInternational) {
      navigate("/booking-international-confirm", {
        state: { tour, guestSize, contactInfo, totalGuests: currentTotalSeats, tourPrice: finalPrice, selectedBeds: [] },
      });
    } else {
      navigate("/booking-tour", {
        state: { tour, guestSize, contactInfo, totalGuests: currentTotalSeats, tourPrice: finalPrice },
      });
    }
  };

  if (isTourEnded) {
    return (
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center shadow-inner">
        <span className="text-5xl block mb-4 opacity-50 grayscale">⏳</span>
        <h3 className="text-xl font-black text-gray-600 uppercase tracking-widest">
          Tour Đã Kết Thúc
        </h3>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Chuyến đi này đã khởi hành. Bạn không thể đặt vé nữa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 bg-white p-4 rounded-2xl border shadow-sm">
      <h4 className="font-bold text-lg border-b pb-2">👥 Thông tin đặt chỗ</h4>

      {/* THÔNG BÁO CHO TOUR QUỐC TẾ */}
      {isInternational && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm font-bold text-blue-700">✈️ Tour Quốc Tế</p>
          <p className="text-xs text-blue-600 mt-1">
            Tour này đi máy bay nên không cần chọn chỗ. Bạn chỉ cần nhập thông tin liên hệ và tiến hành thanh toán.
          </p>
        </div>
      )}

      {["adult", "child", "infant"].map((t) => (
        <div
          key={t}
          className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100"
        >
          <div>
            <p className="text-sm font-bold text-gray-700">
              {t === "adult" ? "Người lớn" : t === "child" ? "Trẻ em" : "Em bé"}
            </p>
            <p className="text-[10px] text-gray-400">
              {t === "adult" ? "Trên 12 tuổi" : t === "child" ? "2 - 11 tuổi" : "Dưới 2 tuổi"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleDecrease(t)}
              disabled={
                (t === "adult" && guestSize.adult <= 1) ||
                (t !== "adult" && guestSize[t] <= 0)
              }
              className="w-8 h-8 border rounded-full bg-white font-bold text-gray-600 hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            >
              -
            </button>
            <span className="font-bold w-4 text-center">{guestSize[t]}</span>
            <button
              type="button"
              onClick={() => handleIncrease(t)}
              disabled={currentTotalSeats >= availableSeats} 
              className="w-8 h-8 border border-gray-300 rounded-full bg-white font-bold text-gray-600 hover:border-blue-500 hover:bg-blue-50 active:scale-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
      ))}

      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">
          Thông tin liên hệ
        </label>
        <input
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          placeholder="Họ tên người đại diện *"
          value={contactInfo.full_name}
          onChange={(e) =>
            setContactInfo({ ...contactInfo, full_name: e.target.value })
          }
        />
        <input
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          placeholder="Số điện thoại liên lạc *"
          value={contactInfo.phone}
          onChange={(e) =>
            setContactInfo({ ...contactInfo, phone: e.target.value })
          }
        />
        <input
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          placeholder="Email nhận vé điện tử *"
          value={contactInfo.email}
          onChange={(e) =>
            setContactInfo({ ...contactInfo, email: e.target.value })
          }
        />
      </div>

      <div className="pt-4 border-t border-dashed">
        <div className="flex justify-between items-end mb-4">
          <span className="text-sm font-bold text-gray-500">Giá Tour:</span>
          <div className="text-right">
            {salePercentage > 0 && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(basePrice)}
              </p>
            )}
            <p className="text-2xl font-black text-blue-700">
              {formatPrice(finalPrice)}
            </p>
          </div>
        </div>

        <button
          onClick={handleProceedToBooking}
          className="w-full py-4 bg-orange-500 text-white font-black text-lg rounded-xl shadow-lg hover:bg-orange-600 transition-all active:scale-95 flex justify-center items-center gap-2"
        >
          {isInternational ? "TIẾP TỤC XÁC NHẬN" : "TIẾP TỤC CHỌN GHẾ"} <span className="text-xl">➔</span>
        </button>
      </div>
    </div>
  );
};

export default BookingForm;