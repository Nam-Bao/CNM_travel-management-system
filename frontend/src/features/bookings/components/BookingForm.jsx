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

  const basePrice =
    (tour?.price?.adult || 0) * guestSize.adult +
    (tour?.price?.child || 0) * guestSize.child +
    (tour?.price?.infant || 0) * guestSize.infant;

  const finalPrice = basePrice * (1 - (tour?.sale_percentage || 0) / 100);

  const handleUpdate = (type, op) => {
    setGuestSize((prev) => {
      let val = op === "plus" ? prev[type] + 1 : prev[type] - 1;
      if (type === "adult" && val < 1) val = 1;
      if (type !== "adult" && val < 0) val = 0;

      // Chặn cộng thêm nếu vượt quá chỗ trống (nếu tour có available_seats)
      if (op === "plus" && tour.available_seats) {
        const totalRequest = prev.adult + prev.child + prev.infant + 1;
        if (totalRequest > tour.available_seats) {
          alert(
            `Rất tiếc, tour này chỉ còn ${tour.available_seats} chỗ trống!`,
          );
          return prev;
        }
      }
      return { ...prev, [type]: val };
    });
  };

  const handleGoToCheckout = (e) => {
    e.preventDefault();
    if (!contactInfo.fullName || !contactInfo.phone || !contactInfo.email)
      return alert(
        "Thịnh ơi, vui lòng nhập đủ thông tin để mình đặt tour nhé!",
      );

    // Đẩy dữ liệu sang trang Thanh toán (/checkout)
    navigate("/checkout", {
      state: {
        bookingData: {
          ...guestSize,
          ...contactInfo,
          total: finalPrice,
        },
        tour: tour,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-700 uppercase text-[10px] tracking-widest border-b pb-2">
        👥 Chọn số lượng khách
      </h4>

      {["adult", "child", "infant"].map((t) => (
        <div
          key={t}
          className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm transition-all hover:bg-white"
        >
          <span className="text-[10px] font-black uppercase text-gray-500">
            {t === "adult" ? "Người lớn" : t === "child" ? "Trẻ em" : "Em bé"}
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleUpdate(t, "minus")}
              className="w-8 h-8 rounded-full border bg-white font-bold text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-colors"
            >
              {" "}
              -{" "}
            </button>
            <span className="font-black text-sm text-blue-900 w-4 text-center">
              {guestSize[t]}
            </span>
            <button
              type="button"
              onClick={() => handleUpdate(t, "plus")}
              className="w-8 h-8 rounded-full border bg-white font-bold text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-colors"
            >
              {" "}
              +{" "}
            </button>
          </div>
        </div>
      ))}

      <div className="space-y-3 pt-2">
        <input
          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
          placeholder="Họ tên khách hàng *"
          value={contactInfo.fullName}
          onChange={(e) =>
            setContactInfo({ ...contactInfo, fullName: e.target.value })
          }
        />
        <input
          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
          placeholder="Số điện thoại liên hệ *"
          value={contactInfo.phone}
          onChange={(e) =>
            setContactInfo({ ...contactInfo, phone: e.target.value })
          }
        />
        <input
          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
          placeholder="Email nhận vé điện tử *"
          value={contactInfo.email}
          onChange={(e) =>
            setContactInfo({ ...contactInfo, email: e.target.value })
          }
        />
      </div>

      <div className="pt-4 border-t border-dashed flex justify-between items-center">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Tạm tính:
        </span>
        <span className="text-2xl font-black text-red-600 tracking-tighter italic">
          {new Intl.NumberFormat("vi-VN").format(finalPrice)} ₫
        </span>
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
