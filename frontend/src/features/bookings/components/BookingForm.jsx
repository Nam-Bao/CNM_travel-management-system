import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bookingApi from "../api/bookingApi";

const BookingForm = ({ tour }) => {
  const navigate = useNavigate();
  const [guestSize, setGuestSize] = useState({ adult: 1, child: 0, infant: 0 });
  const [contactInfo, setContactInfo] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  if (!tour) return null;

  // KIỂM TRA TOUR ĐÃ KẾT THÚC CHƯA
  const today = new Date();
  const startDate = new Date(tour.start_date);
  // Nếu ngày hôm nay lớn hơn ngày khởi hành => Tour đã kết thúc
  const isTourEnded = today > startDate;

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p || 0);

  const basePrice =
    (tour?.price?.adult || 0) * guestSize.adult +
    (tour?.price?.child || 0) * guestSize.child +
    (tour?.price?.infant || 0) * guestSize.infant;
  const salePercentage = tour?.sale_percentage || 0;
  const finalPrice = basePrice * (1 - salePercentage / 100);

  const handleUpdate = (type, op) => {
    setGuestSize((prev) => {
      let val = op === "plus" ? prev[type] + 1 : prev[type] - 1;
      if (type === "adult" && val < 1) val = 1;
      if (type !== "adult" && val < 0) val = 0;
      return { ...prev, [type]: val };
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!contactInfo.full_name || !contactInfo.phone || !contactInfo.email)
      return alert("Vui lòng điền đủ thông tin!");

    setLoading(true);
    try {
      const payload = {
        tourId: tour._id,
        guest_size: {
          adult: Number(guestSize.adult),
          child: Number(guestSize.child),
          infant: Number(guestSize.infant),
        },
        contact_info: contactInfo,
      };
      await bookingApi.createBooking(payload);
      alert("🎉 Đặt tour thành công!");
      navigate("/my-bookings");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi đặt tour!");
    } finally {
      setLoading(false);
    }
  };

  // NẾU TOUR ĐÃ KẾT THÚC -> HIỂN THỊ GIAO DIỆN KHÓA
  if (isTourEnded) {
    return (
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center shadow-inner">
        <span className="text-5xl block mb-4 opacity-50 grayscale">⏳</span>
        <h3 className="text-xl font-black text-gray-600 uppercase tracking-widest">
          Tour Đã Kết Thúc
        </h3>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Chuyến đi này đã khởi hành. Bạn không thể đặt vé nữa.
          <br />
          Vui lòng chọn một lịch trình khác nhé!
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 border border-gray-300 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition"
        >
          Xem tour khác
        </button>
      </div>
    );
  }

  // NẾU TOUR CHƯA KẾT THÚC -> HIỂN THỊ FORM BÌNH THƯỜNG
  return (
    <div className="space-y-4 mt-4">
      <h4 className="font-bold">👥 Số lượng khách</h4>
      {["adult", "child", "infant"].map((t) => (
        <div
          key={t}
          className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
        >
          <span className="text-sm uppercase font-semibold">
            {t === "adult" ? "Người lớn" : t === "child" ? "Trẻ em" : "Em bé"}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleUpdate(t, "minus")}
              className="w-8 h-8 border rounded-full"
            >
              -
            </button>
            <span className="font-bold">{guestSize[t]}</span>
            <button
              type="button"
              onClick={() => handleUpdate(t, "plus")}
              className="w-8 h-8 border rounded-full"
            >
              +
            </button>
          </div>
        </div>
      ))}
      <div className="space-y-2 pt-2 border-t text-sm">
        <input
          className="w-full p-2 border rounded"
          placeholder="Họ tên *"
          onChange={(e) =>
            setContactInfo({ ...contactInfo, full_name: e.target.value })
          }
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="SĐT *"
          onChange={(e) =>
            setContactInfo({ ...contactInfo, phone: e.target.value })
          }
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Email *"
          onChange={(e) =>
            setContactInfo({ ...contactInfo, email: e.target.value })
          }
        />
      </div>
      <div className="pt-4 border-t border-dashed">
        <div className="flex justify-between items-end mb-4">
          <span className="text-sm font-bold text-gray-500">Tạm tính:</span>
          <div className="text-right">
            {salePercentage > 0 && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(basePrice)}
              </p>
            )}
            <p className="text-2xl font-black text-orange-600">
              {formatPrice(finalPrice)}
            </p>
          </div>
        </div>
        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl active:scale-95 transition-transform"
        >
          {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT TOUR"}
        </button>
      </div>
    </div>
  );
};

export default BookingForm;
