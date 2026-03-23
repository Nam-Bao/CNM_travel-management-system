import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import bookingApi from "../api/bookingApi";
import axios from "axios";
import ReviewForm from "../../reviews/components/ReviewForm";

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewingTourId, setReviewingTourId] = useState(null);

  // ✅ STATE QUẢN LÝ MODAL HỦY TOUR
  const [cancelModalData, setCancelModalData] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await bookingApi.getMyBookings();
      const data = res.data?.data || res.data || [];
      setBookings([...data].reverse());
    } catch (err) {
      setError("Không thể tải lịch sử đặt tour. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkLoginStatus = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Lỗi đọc thông tin user', e);
        }
      } else {
        navigate('/auth'); 
      }
    };
    checkLoginStatus();
    fetchHistory();
  }, [navigate, fetchHistory]);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      navigate('/'); 
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  // ✅ BƯỚC 1 CỦA HỦY: MỞ MODAL VÀ TÍNH TOÁN SỐ LIỆU
  const handleOpenCancelModal = (booking) => {
    const tour = booking.tour;
    if (!tour) return alert("Dữ liệu tour không tồn tại.");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(tour.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return alert("Tour đã khởi hành, không thể hủy.");
    }

    let refundInfo = "";
    let refundPercent = 0;
    if (diffDays >= 30) { refundInfo = "Hoàn 100% chi phí"; refundPercent = 100; }
    else if (diffDays >= 20) { refundInfo = "Hoàn 50% chi phí"; refundPercent = 50; }
    else if (diffDays >= 15) { refundInfo = "Hoàn 20% chi phí"; refundPercent = 20; }
    else { refundInfo = "Hủy sát ngày (dưới 15 ngày), KHÔNG hoàn tiền"; refundPercent = 0; }

    // Lưu dữ liệu vào State để hiển thị lên Modal
    setCancelModalData({
      bookingId: booking._id,
      tourTitle: tour.title,
      startDate: startDate.toLocaleDateString('vi-VN'),
      diffDays,
      refundInfo,
      refundPercent,
      totalPrice: booking.total_price,
      refundAmount: (booking.total_price * refundPercent) / 100
    });
  };

  // ✅ BƯỚC 2 CỦA HỦY: KHÁCH BẤM XÁC NHẬN TRÊN MODAL -> GỌI API
  const submitCancelBooking = async () => {
    if (!cancelModalData) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/bookings/${cancelModalData.bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(res.data.message || "Đã hủy tour thành công!");
      setCancelModalData(null); // Đóng Modal
      fetchHistory(); // Refresh dữ liệu
      
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi hủy tour.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center font-bold text-blue-600">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-4"></div>
        Đang tải lịch sử đặt tour...
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans relative">
      
      {/* ===================== MODAL HỦY TOUR ===================== */}
      {cancelModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 animate-slide-up">
            {/* Header Modal */}
            <div className="bg-red-50 p-5 border-b border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl shadow-sm">⚠️</div>
              <div>
                <h3 className="text-xl font-black text-red-700">Yêu cầu Hủy Tour</h3>
                <p className="text-xs text-red-500 font-bold uppercase tracking-wider mt-0.5">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            {/* Body Modal */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Tên chuyến đi:</p>
                <p className="font-bold text-gray-800 line-clamp-2">{cancelModalData.tourTitle}</p>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                  📅 Khởi hành: <span className="font-bold text-blue-600">{cancelModalData.startDate}</span>
                </p>
              </div>

              <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                <h4 className="font-black text-orange-800 mb-2 border-b border-orange-200/50 pb-2">Chính Sách Hoàn Tiền</h4>
                <ul className="text-sm text-orange-700 space-y-1.5 font-medium">
                  <li>• Bạn đang hủy trước <span className="font-black text-orange-600 text-base">{cancelModalData.diffDays} ngày</span></li>
                  <li>• Mức áp dụng: <span className="font-black text-orange-600">{cancelModalData.refundInfo}</span></li>
                </ul>
              </div>

              <div className="flex justify-between items-end pt-2">
                <span className="text-gray-500 font-bold text-sm">Số tiền hoàn lại dự kiến:</span>
                <span className="text-3xl font-black text-green-600">{formatPrice(cancelModalData.refundAmount)}</span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setCancelModalData(null)}
                className="px-5 py-2.5 rounded-lg font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition"
              >
                Đóng, không hủy nữa
              </button>
              <button 
                onClick={submitCancelBooking}
                className="px-5 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 hover:shadow-lg transition"
              >
                Xác nhận Hủy tour
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===================== KẾT THÚC MODAL ===================== */}


      {/* HEADER PAGE */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b mb-8 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <Link to="/" className="text-3xl font-extrabold text-blue-600 tracking-tighter">
            Travel<span className="text-orange-500">oke</span>
          </Link>
          <nav className="flex items-center gap-6">
            {/* ... (Giữ nguyên header cũ) ... */}
            {currentUser ? (
              <div className="flex items-center gap-4 bg-gray-50 p-1.5 pr-4 rounded-full border border-gray-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {currentUser.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block leading-tight">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Thành viên</p>
                  <p className="text-sm font-bold text-gray-700">{currentUser.full_name}</p>
                </div>
                <button onClick={handleLogout} className="ml-2 text-red-500 hover:text-red-700 font-bold text-xs uppercase border-l pl-4 border-gray-200">
                  Đăng xuất
                </button>
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH */}
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
          ✈️ Lịch sử chuyến đi
        </h1>

        {error && <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6 font-bold shadow-sm">{error}</div>}

        {bookings.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl shadow-sm border text-center">
            <div className="text-6xl mb-6 grayscale opacity-30">🏜️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn chưa có chuyến đi nào</h2>
            <Link to="/" className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg inline-block mt-4">Khám phá tour ngay</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((item) => {
              
              const today = new Date();
              const startDate = new Date(item.tour?.start_date);
              const isTourEnded = today > startDate;
              const isReviewing = reviewingTourId === item.tour?._id;
              const isCanceled = item.status === 'CANCELED';

              return (
                <div key={item._id} className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all ${isCanceled ? 'opacity-80' : ''}`}>
                  <div className="flex flex-col md:flex-row">
                    
                    {/* Ảnh Tour */}
                    <div className="relative w-full md:w-72 h-56 md:h-auto shrink-0">
                      {isCanceled && (
                         <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center z-10">
                           <div className="border-4 border-red-500 text-red-500 font-black text-2xl px-4 py-2 transform -rotate-12 bg-white/90 backdrop-blur-sm shadow-xl uppercase tracking-widest rounded-lg">
                             Đã Hủy
                           </div>
                         </div>
                      )}
                      <img
                        src={item.tour?.images?.[0] || "https://placehold.co/300x200?text=Tour+Image"}
                        className={`w-full h-full object-cover ${isTourEnded || isCanceled ? 'grayscale' : ''}`}
                        alt="Tour"
                      />
                    </div>

                    {/* Thông tin vé */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                            {item.tour?.title || <span className="text-red-500 italic">Tour đã bị xóa khỏi hệ thống</span>}
                          </h2>
                          <span className="text-xs text-gray-400 font-bold bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap border">
                            #{item._id.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        {item.tour && (
                          <p className="text-sm text-gray-500 mb-4">
                            📅 Khởi hành: <span className="text-gray-800 font-bold">{new Date(item.tour.start_date).toLocaleDateString("vi-VN")}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex justify-between items-end border-t pt-5">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Tổng tiền thanh toán</p>
                          <p className={`text-2xl font-black ${isTourEnded || isCanceled ? 'text-gray-400 line-through decoration-red-500 decoration-2' : 'text-orange-600'}`}>
                            {formatPrice(item.total_price)}
                          </p>
                        </div>
                        
                        {/* QUẢN LÝ TRẠNG THÁI HIỂN THỊ */}
                        {isCanceled ? (
                          <div className="flex flex-col items-end gap-2">
                            <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-red-200">
                              Hoàn {item.refund_percentage || 0}% tiền
                            </span>
                            <span className="text-sm font-bold text-red-500">
                              +{formatPrice(item.refund_amount || 0)}
                            </span>
                          </div>
                        ) : isTourEnded ? (
                          <div className="flex flex-col items-end gap-2">
                            <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border">Đã hoàn thành</span>
                            <button 
                              onClick={() => setReviewingTourId(isReviewing ? null : item.tour._id)}
                              className="text-sm font-black text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200"
                            >
                              {isReviewing ? 'Đóng đánh giá ✖' : '⭐ Đánh giá chuyến đi'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-3">
                            <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-green-200 shadow-sm">
                              Thành công
                            </span>
                            
                            {/* NÚT YÊU CẦU HỦY GỌI MODAL THAY VÌ CONFIRM */}
                            <button 
                              onClick={() => handleOpenCancelModal(item)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition"
                            >
                              ✖ Yêu cầu Hủy Tour
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isReviewing && !isCanceled && (
                    <div className="bg-blue-50/30 border-t-2 border-dashed border-blue-200 p-6">
                      <ReviewForm tourId={item.tour._id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;