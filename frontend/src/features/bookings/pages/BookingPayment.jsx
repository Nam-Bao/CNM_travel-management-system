import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import bookingApi from "../api/bookingApi";
import axios from "axios";

const BookingPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tour, guestSize, contactInfo, tourPrice, selectedBeds } = location.state || {};

  if (!tour) {
    navigate("/");
    return null;
  }

  const [paymentPercent, setPaymentPercent] = useState(100); 
  const [paymentMethod, setPaymentMethod] = useState("VNPAY"); 
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // States quản lý QR Code
  const [createdBooking, setCreatedBooking] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // BẠN CÓ THỂ ĐIỀN THẲNG SỐ TÀI KHOẢN VÀO ĐÂY ĐỂ TRÁNH LỖI MÃ QR KHÔNG LOAD
  const BANK_ID = import.meta.env.VITE_BANK_ID || "MB"; 
  const ACCOUNT_NO = import.meta.env.VITE_ACCOUNT_NO || "0123456789"; 
  const ACCOUNT_NAME = import.meta.env.VITE_ACCOUNT_NAME || "NGUYEN VAN A"; 

  const amountToPay = (tourPrice * paymentPercent) / 100;
  
  // Link API tạo ảnh VietQR Động
  const transferMessage = createdBooking ? `TT TOUR ${createdBooking._id.slice(-6).toUpperCase()}` : "";
  const vietQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.png?amount=${amountToPay}&addInfo=${encodeURIComponent(transferMessage)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

  // Tính năng Polling: Hỏi thăm Backend mỗi 3 giây
  useEffect(() => {
    let intervalId;
    if (isPolling && createdBooking) {
      intervalId = setInterval(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${createdBooking._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Lấy trạng thái mới nhất từ Database
            const currentStatus = res.data?.data?.status;
            
            // 🔥 BÍ QUYẾT NẰM Ở ĐÂY 🔥
            // Lúc mới tạo, đơn hàng luôn là "pending".
            // Webhook chạy xong sẽ đổi thành một từ khác. Ta chỉ cần thấy nó KHÁC "pending" là cho qua ngay!
            if (currentStatus && currentStatus !== "pending") {
                clearInterval(intervalId); // Tắt vòng lặp
                setIsPolling(false);
                alert("Hệ thống đã nhận được thanh toán của bạn!");
                navigate("/my-bookings"); // Chuyển thẳng về trang lịch sử
            }
        } catch (error) {
            console.log("Đang chờ thanh toán..."); 
        }
      }, 3000);
    }
    
    // Dọn dẹp bộ nhớ khi rời khỏi trang
    return () => clearInterval(intervalId);
  }, [isPolling, createdBooking, navigate]);

  const handleSubmitPayment = async () => {
    if (!agreeTerms) return alert("Bạn cần đồng ý với các Điều khoản trước khi thanh toán.");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        tourId: tour._id,
        guest_size: guestSize,
        contact_info: contactInfo,
        selected_beds: selectedBeds || [], 
        payment_method: paymentMethod,
        payment_percent: paymentPercent
      };
      
      const bookingRes = await bookingApi.createBooking(payload);
      const newBooking = bookingRes.data?.data || bookingRes.data;

      if (paymentMethod === "VNPAY") {
        const vnpayRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/payment/vnpay/create_payment_url`,
          { amount: amountToPay, bookingId: newBooking._id, bankCode: "NCB" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (vnpayRes.data && vnpayRes.data.url) window.location.href = vnpayRes.data.url; 
      } else if (paymentMethod === "VIETQR") {
        setCreatedBooking(newBooking);
        setIsPolling(true);
        setLoading(false); 
      } else {
        alert("🎉 Đặt chỗ thành công! Vui lòng thanh toán tại văn phòng.");
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
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 font-bold">← Quay lại</button>
          <span className="font-black text-xl text-gray-800">Xác nhận thanh toán</span>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-blue-700 border-b pb-3 mb-4">1. Thông Tin Chuyến Đi</h2>
            <div className="flex gap-4">
              <img src={tour.images?.[0] || "https://placehold.co/150"} alt="tour" className="w-32 h-24 object-cover rounded-xl" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{tour.title}</h3>
                <p className="text-sm text-gray-500 mt-2">📅 Khởi hành: <span className="font-bold text-gray-800">{new Date(tour.start_date).toLocaleDateString("vi-VN")}</span></p>
                <p className="text-sm text-gray-600 mt-2 font-medium">💺 Ghế: <span className="text-blue-600 font-bold">{selectedBeds?.length > 0 ? selectedBeds.join(", ") : "Chưa chọn"}</span></p>
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
          </div>
        </div>

        {/* CỘT PHẢI: THANH TOÁN (Giữ form cũ của bạn) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-orange-500 sticky top-24">
            
            <h2 className="text-xl font-black text-gray-800 mb-4">Mức Thanh Toán</h2>
            <div className="space-y-3 mb-6">
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${paymentPercent === 100 ? 'border-orange-500 bg-orange-50/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" className="w-5 h-5 accent-orange-500" checked={paymentPercent === 100} onChange={() => setPaymentPercent(100)} />
                  <span className="font-bold text-gray-700">Thanh toán 100%</span>
                </div>
                <span className="font-black text-orange-600">{formatPrice(tourPrice)}</span>
              </label>

              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${paymentPercent === 50 ? 'border-orange-500 bg-orange-50/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" className="w-5 h-5 accent-orange-500" checked={paymentPercent === 50} onChange={() => setPaymentPercent(50)} />
                  <span className="font-bold text-gray-700">Đặt cọc 50%</span>
                </div>
                <span className="font-black text-orange-600">{formatPrice(tourPrice / 2)}</span>
              </label>
            </div>

            <h2 className="text-xl font-black text-gray-800 mb-4 border-t pt-4">Hình Thức Thanh Toán</h2>
            <div className="flex gap-4 mb-4">
              <button onClick={() => setPaymentMethod("VNPAY")} className={`flex-1 py-3 px-2 rounded-xl border-2 font-bold ${paymentMethod === "VNPAY" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200"}`}>💳 VNPay</button>
              <button onClick={() => setPaymentMethod("VIETQR")} className={`flex-1 py-3 px-2 rounded-xl border-2 font-bold ${paymentMethod === "VIETQR" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200"}`}>📱 VietQR</button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 mt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 accent-blue-600" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                <span className="text-xs text-gray-600">Tôi đã đọc và đồng ý với Điều khoản đặt tour.</span>
              </label>
            </div>

            <button
              onClick={handleSubmitPayment}
              disabled={loading || !agreeTerms || (createdBooking && paymentMethod === "VIETQR")}
              className="w-full py-4 bg-blue-600 text-white font-black text-lg rounded-xl transition-all disabled:bg-gray-300 shadow-lg hover:bg-blue-700 flex justify-center items-center"
            >
              {loading ? "ĐANG XỬ LÝ..." : (createdBooking && paymentMethod === "VIETQR" ? "ĐANG CHỜ THANH TOÁN..." : `XÁC NHẬN ĐẶT TOUR`)}
            </button>

            {/* 🔥 KHUNG MÃ QR SẼ HIỆN RA Ở DƯỚI CÙNG SAU KHI BẤM NÚT 🔥 */}
            {createdBooking && paymentMethod === "VIETQR" && (
                <div className="mt-6 flex flex-col items-center bg-blue-50 p-4 rounded-xl border-2 border-blue-200 border-dashed animate-fade-in">
                    <h4 className="font-black text-blue-800 mb-3 text-center">Mở App Ngân hàng quét mã QR</h4>
                    
                    <div className="bg-white p-2 rounded-xl shadow-sm relative">
                        <img src={vietQrUrl} alt="Mã VietQR" className="w-48 h-auto" />
                    </div>

                    <div className="mt-4 w-full text-sm">
                        <div className="flex justify-between border-b border-blue-200 pb-2 mb-2">
                            <span className="text-gray-600">Nội dung CK:</span> 
                            <span className="font-black text-blue-700">{transferMessage}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Số tiền:</span> 
                            <span className="font-black text-red-600">{formatPrice(amountToPay)}</span>
                        </div>
                    </div>
                    
                    {isPolling && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-bold animate-pulse">
                            <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                            Đang chờ nhận tiền...
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingPayment;