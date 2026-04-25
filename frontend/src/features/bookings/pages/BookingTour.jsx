import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import bookingApi from "../api/bookingApi";
import axios from "axios";

const BookingTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tour, guestSize, contactInfo, finalPrice } = location.state || {};

  // Nếu người dùng gõ URL trực tiếp mà không qua form, đẩy về trang chủ
  if (!tour) {
    navigate("/");
    return null;
  }

  const [paymentPercent, setPaymentPercent] = useState(100); // 100 hoặc 50
  const [paymentMethod, setPaymentMethod] = useState("VNPAY"); // VNPAY hoặc CASH
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const amountToPay = (finalPrice * paymentPercent) / 100;

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

  const handleSubmitPayment = async () => {
    if (!agreeTerms) {
      return alert("Bạn cần đồng ý với các Điều khoản & Chính sách trước khi thanh toán.");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // 1. Tạo đơn hàng vào Database (Trạng thái mặc định là PENDING)
      const payload = {
        tourId: tour._id,
        guest_size: guestSize,
        contact_info: contactInfo,
        payment_method: paymentMethod // Gửi phương thức vào DB
      };
      
      const bookingRes = await bookingApi.createBooking(payload);
      const newBooking = bookingRes.data?.data || bookingRes.data;

      // 2. Xử lý tùy theo Phương thức thanh toán
      if (paymentMethod === "VNPAY") {
        // GỌI VNPAY
        const vnpayRes = await axios.post(
          "http://localhost:5000/api/payment/vnpay/create_payment_url",
          {
            amount: amountToPay, // Thanh toán 50% hoặc 100% tùy chọn
            bookingId: newBooking._id,
            bankCode: "NCB",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (vnpayRes.data && vnpayRes.data.url) {
          window.location.href = vnpayRes.data.url;
        } else {
          alert("Lỗi khởi tạo cổng VNPay.");
          setLoading(false);
        }
      } else {
        // TIỀN MẶT - Đẩy thẳng về trang lịch sử
        alert("🎉 Đặt chỗ thành công! Vui lòng thanh toán tại văn phòng trước ngày khởi hành 7 ngày.");
        navigate("/my-bookings");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xử lý giao dịch!");
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      <header className="bg-white shadow-sm h-20 flex items-center border-b">
        <div className="max-w-6xl mx-auto px-4 w-full flex justify-between">
          <Link to={`/tours/${tour.slug}`} className="text-gray-500 hover:text-blue-600 font-bold">
            ← Quay lại trang chi tiết
          </Link>
          <span className="font-black text-xl text-gray-800">Xác nhận thanh toán</span>
          <div className="w-20"></div> {/* Spacer để cân bằng Header */}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN ĐƠN HÀNG */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-blue-700 border-b pb-3 mb-4">1. Thông Tin Chuyến Đi</h2>
            <div className="flex gap-4">
              <img src={tour.images?.[0] || "https://placehold.co/150"} alt="tour" className="w-32 h-24 object-cover rounded-xl" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{tour.title}</h3>
                <p className="text-sm text-gray-500 mt-2">📅 Khởi hành: <span className="font-bold text-gray-800">{new Date(tour.start_date).toLocaleDateString("vi-VN")}</span></p>
                <div className="mt-2 flex gap-3 text-sm font-semibold text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                  <span>👤 Lớn: {guestSize.adult}</span>
                  <span>👶 Trẻ: {guestSize.child}</span>
                  <span>🍼 Em bé: {guestSize.infant}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-blue-700 border-b pb-3 mb-4">2. Thông Tin Liên Hệ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-xs text-gray-400 font-bold uppercase">Họ và tên</p>
                <p className="font-semibold text-gray-800">{contactInfo.full_name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-xs text-gray-400 font-bold uppercase">Số điện thoại</p>
                <p className="font-semibold text-gray-800">{contactInfo.phone}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border md:col-span-2">
                <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                <p className="font-semibold text-gray-800">{contactInfo.email}</p>
              </div>
            </div>
            <p className="text-[11px] text-red-500 mt-3 italic">* Vui lòng kiểm tra kỹ thông tin liên lạc để nhận vé điện tử.</p>
          </div>
        </div>

        {/* CỘT PHẢI: THANH TOÁN */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-orange-500 sticky top-24">
            <h2 className="text-xl font-black text-gray-800 mb-4">Mức Thanh Toán</h2>
            
            <div className="space-y-3 mb-6">
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${paymentPercent === 100 ? 'border-orange-500 bg-orange-50/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="percent" className="w-5 h-5 accent-orange-500" checked={paymentPercent === 100} onChange={() => setPaymentPercent(100)} />
                  <span className="font-bold text-gray-700">Thanh toán 100%</span>
                </div>
                <span className="font-black text-orange-600">{formatPrice(finalPrice)}</span>
              </label>

              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${paymentPercent === 50 ? 'border-orange-500 bg-orange-50/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="percent" className="w-5 h-5 accent-orange-500" checked={paymentPercent === 50} onChange={() => setPaymentPercent(50)} />
                  <span className="font-bold text-gray-700">Đặt cọc 50%</span>
                </div>
                <span className="font-black text-orange-600">{formatPrice(finalPrice / 2)}</span>
              </label>
            </div>

            <h2 className="text-xl font-black text-gray-800 mb-4 border-t pt-4">Hình Thức Thanh Toán</h2>
            <div className="space-y-3 mb-6">
              <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${paymentMethod === 'VNPAY' ? 'border-blue-500 bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <input type="radio" name="method" className="w-5 h-5 accent-blue-600 mr-3" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod("VNPAY")} />
                <div>
                  <p className="font-bold text-gray-700">Thanh toán trực tuyến VNPay</p>
                  <p className="text-xs text-gray-500">Hỗ trợ thẻ ATM, Visa, MasterCard, QR Code</p>
                </div>
              </label>

              <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <input type="radio" name="method" className="w-5 h-5 accent-blue-600 mr-3" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod("CASH")} />
                <div>
                  <p className="font-bold text-gray-700">Thanh toán Tiền mặt</p>
                  <p className="text-xs text-gray-500">Giữ chỗ. Thanh toán tại văn phòng trước 7 ngày khởi hành.</p>
                </div>
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 accent-blue-600" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Tôi đã đọc và đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản đặt tour</a> và <a href="#" className="text-blue-600 hover:underline">Chính sách hoàn hủy</a> của Traveloke.
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmitPayment}
              disabled={loading || !agreeTerms}
              className="w-full py-4 bg-blue-600 text-white font-black text-xl rounded-xl active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:bg-blue-700 flex justify-center items-center"
            >
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : `THANH TOÁN ${formatPrice(amountToPay)}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingTour;