<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import tourApi from "../api/tourApi";
import BookingForm from "../../bookings/components/BookingForm";
//import ReviewForm from "../../reviews/components/ReviewForm";

const TourDetailPage = () => {
  const { slug } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await tourApi.getTourBySlug(slug);
        setTour(response);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin chi tiết tour này.");
      } finally {
        setLoading(false);
      }
=======
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import tourApi from '../api/tourApi';

const TourDetailPage = () => {
    const { slug } = useParams(); // Lấy ID tour từ URL
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State cho Ảnh đang được chọn xem to
    const [mainImage, setMainImage] = useState('');
    
    // State cho User đã đăng nhập
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Kiểm tra đăng nhập
        const checkLoginStatus = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setCurrentUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Lỗi đọc thông tin user', e);
                }
            }
        };
        checkLoginStatus();

        const fetchTourDetail = async () => {
            try {
                const response = await tourApi.getTourBySlug(slug);
                setTour(response.data);
                
                // Mặc định lấy ảnh đầu tiên làm ảnh to, nếu không có thì dùng ảnh giả
                if (response.data.images && response.data.images.length > 0) {
                    setMainImage(response.data.images[0]);
                } else {
                    setMainImage('https://placehold.co/800x500?text=No+Image');
                }
            } catch (err) {
                setError('Không thể tải thông tin chuyến đi. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchTourDetail();
    }, [slug]);

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
            navigate('/'); 
        }
    };

    // Hàm format tiền tệ VNĐ
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
>>>>>>> 25396e6df31d609341089dadb81913efb9d236e8
    };
    fetchTour();
  }, [slug]);

<<<<<<< HEAD
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };
=======
    // Hàm tính giá sau khi giảm
    const calcSalePrice = (price) => {
        return price * (1 - (tour.sale_percentage || 0) / 100);
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 text-xl font-bold text-blue-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mr-4"></div>
            Đang tải thông tin Tour...
        </div>
    );

    if (error || !tour) return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
            <div className="bg-red-100 text-red-700 p-8 rounded-xl font-bold text-lg shadow-lg">
                {error || 'Tour không tồn tại!'}
            </div>
        </div>
    );
>>>>>>> 25396e6df31d609341089dadb81913efb9d236e8

  if (loading)
    return (
<<<<<<< HEAD
      <div className="text-center py-20 text-xl text-gray-500">
        Đang tải thông tin chuyến đi...
      </div>
=======
        <div className="bg-gray-50 min-h-screen pb-20 flex flex-col">
            {/* Header Đồng bộ với HomePage */}
            <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-3xl font-extrabold text-blue-600">
                        Travel<span className="text-orange-500">oke</span>
                    </Link>
                    
                    <nav className="flex items-center gap-4 text-sm font-medium">
                        {currentUser ? (
                            <div className="flex items-center gap-4 border-l-2 pl-4 border-gray-200">
                                <div className="hidden md:block">
                                    <span className="text-gray-500">Xin chào, </span>
                                    <span className="font-bold text-blue-700">{currentUser.username || currentUser.full_name || 'Khách hàng'}!</span>
                                </div>
                                
                                {currentUser.role === 'admin' && (
                                    <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-bold px-2">
                                        ⚙️ Quản trị
                                    </Link>
                                )}

                                <button 
                                    onClick={handleLogout}
                                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition shadow-sm text-sm"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <Link 
                                to="/auth"  
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md text-sm block text-center"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Thanh điều hướng nhỏ */}
            <div className="bg-blue-600 text-white py-3 shadow-md mb-8">
                <div className="max-w-7xl mx-auto px-4 text-sm">
                    <Link to="/" className="hover:underline text-blue-100 font-medium">← Trang chủ</Link>
                    <span className="mx-2">/</span>
                    <span className="opacity-75">{tour.title}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* CỘT TRÁI: HÌNH ẢNH & CHI TIẾT (Chiếm 2 phần) */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Khu vực Gallery Ảnh */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border">
                            {/* Ảnh to */}
                            <img 
                                src={mainImage} 
                                alt={tour.title} 
                                className="w-full h-80 md:h-[450px] object-cover rounded-xl shadow-inner mb-4 transition-all duration-300"
                            />
                            {/* Dải ảnh nhỏ (Thumbnails) */}
                            {tour.images && tour.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {tour.images.map((img, index) => (
                                        <img 
                                            key={index}
                                            src={img}
                                            alt={`thumbnail-${index}`}
                                            onClick={() => setMainImage(img)}
                                            className={`h-20 w-28 object-cover rounded-lg cursor-pointer border-2 transition-all shrink-0 ${mainImage === img ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ĐIỀU CHỈNH: THÔNG TIN CƠ BẢN DI CHUYỂN XUỐNG DƯỚI ẢNH */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-l-4 border-l-blue-600">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-6 leading-tight">{tour.title}</h1>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                                    <span className="text-xl">⏱️</span>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Thời lượng</div>
                                        <div className="text-gray-800">{tour.duration}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                                    <span className="text-xl">📅</span>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Khởi hành</div>
                                        <div className="text-blue-600 font-bold">{new Date(tour.start_date).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                                    <span className="text-xl">🪑</span>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Chỗ trống</div>
                                        <div className="text-orange-600 font-bold">{tour.available_seats} / {tour.max_seats} vé</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Khu vực Tổng quan */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">📝 Tổng quan chuyến đi</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-justify">
                                {tour.description}
                            </p>
                        </div>

                        {/* Khu vực Lộ trình (Itinerary) */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">🗺️ Lịch trình chi tiết</h2>
                            {tour.itinerary && tour.itinerary.length > 0 ? (
                                <div className="space-y-6">
                                    {tour.itinerary.map((day, index) => (
                                        <div key={index} className="flex gap-4">
                                            {/* Cột timeline */}
                                            <div className="flex flex-col items-center">
                                                <div className="bg-blue-600 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center shrink-0 shadow-md">
                                                    D{index + 1}
                                                </div>
                                                {index !== tour.itinerary.length - 1 && <div className="w-1 h-full bg-blue-100 mt-2 rounded"></div>}
                                            </div>
                                            {/* Nội dung ngày */}
                                            <div className="pb-8">
                                                <div className="text-sm font-bold text-blue-600 mb-1">{day.day}</div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-3">{day.title}</h3>
                                                <p className="text-gray-600 whitespace-pre-line leading-relaxed text-justify bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    {day.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Đang cập nhật lịch trình...</p>
                            )}
                        </div>
                    </div>

                    {/* CỘT PHẢI: BẢNG GIÁ & BOOKING BOX (Sticky - Luôn trôi theo màn hình) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-orange-500 sticky top-24">
                            
                            {/* Huy hiệu Sale */}
                            {tour.sale_percentage > 0 && (
                                <div className="absolute -top-4 -right-4 bg-red-600 text-white font-black px-4 py-2 rounded-full shadow-lg transform rotate-3 scale-110">
                                    GIẢM {tour.sale_percentage}%
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Bảng Giá Vé</h3>

                            <div className="space-y-4 mb-8">
                                {/* Vé Người Lớn */}
                                <div className="flex justify-between items-center border-b pb-3">
                                    <div>
                                        <p className="font-bold text-gray-700">Người lớn</p>
                                        <p className="text-xs text-gray-500">&gt; 12 tuổi</p>
                                    </div>
                                    <div className="text-right">
                                        {tour.sale_percentage > 0 ? (
                                            <>
                                                <p className="text-sm text-gray-400 line-through">{formatPrice(tour.price?.adult)}</p>
                                                <p className="text-lg font-black text-red-600">{formatPrice(calcSalePrice(tour.price?.adult))}</p>
                                            </>
                                        ) : (
                                            <p className="text-lg font-black text-blue-700">{formatPrice(tour.price?.adult)}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Vé Trẻ Em */}
                                <div className="flex justify-between items-center border-b pb-3">
                                    <div>
                                        <p className="font-bold text-gray-700">Trẻ em</p>
                                        <p className="text-xs text-gray-500">2 - 12 tuổi</p>
                                    </div>
                                    <div className="text-right">
                                        {tour.sale_percentage > 0 ? (
                                            <>
                                                <p className="text-sm text-gray-400 line-through">{formatPrice(tour.price?.child)}</p>
                                                <p className="text-lg font-black text-red-600">{formatPrice(calcSalePrice(tour.price?.child))}</p>
                                            </>
                                        ) : (
                                            <p className="text-lg font-bold text-gray-800">{tour.price?.child > 0 ? formatPrice(tour.price?.child) : 'Miễn phí'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Vé Em Bé */}
                                <div className="flex justify-between items-center pb-2">
                                    <div>
                                        <p className="font-bold text-gray-700">Em bé</p>
                                        <p className="text-xs text-gray-500">&lt; 2 tuổi</p>
                                    </div>
                                    <div className="text-right">
                                        {tour.sale_percentage > 0 && tour.price?.infant > 0 ? (
                                            <>
                                                <p className="text-sm text-gray-400 line-through">{formatPrice(tour.price?.infant)}</p>
                                                <p className="text-lg font-black text-red-600">{formatPrice(calcSalePrice(tour.price?.infant))}</p>
                                            </>
                                        ) : (
                                            <p className="text-lg font-bold text-gray-800">{tour.price?.infant > 0 ? formatPrice(tour.price?.infant) : 'Miễn phí'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* NÚT ĐẶT TOUR CHỜ ĐỒNG ĐỘI LẮP RÁP */}
                            <button 
                                onClick={() => alert('Phần Form Đặt Chỗ (Booking) bạn của bạn đang code sẽ được lắp vào đây!')}
                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-xl shadow-lg transition transform hover:-translate-y-1"
                            >
                                ĐẶT TOUR NGAY
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">Cam kết giá tốt nhất • Hoàn tiền 100% nếu hủy trước 7 ngày</p>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-300 py-10 text-center text-sm border-t-4 border-blue-600 mt-auto">
                <p>&copy; 2026 Traveloke. Tất cả các quyền được bảo lưu.</p>
                <p className="mt-1">Nền tảng đặt tour du lịch hàng đầu.</p>
            </footer>
        </div>
>>>>>>> 25396e6df31d609341089dadb81913efb9d236e8
    );

  if (error)
    return (
      <div className="text-center py-20 text-red-500 text-xl">{error}</div>
    );

  if (!tour)
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy tour.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <Link to="/" className="text-3xl font-bold text-blue-600">
            Travel<span className="text-orange-500">Go</span>
          </Link>
          <Link to="/" className="text-gray-600">
            ← Trang chủ
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <h1 className="text-4xl font-bold mb-6">{tour.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* IMAGE */}
            <div className="rounded-xl overflow-hidden h-96">
              <img
                src={
                  tour.image_url || "https://placehold.co/800x400?text=No+Image"
                }
                alt={tour.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* INFO */}
            <div className="flex gap-4 bg-white p-4 rounded shadow">
              <div>⏱️ {tour.duration}</div>
              <div>
                📅 {new Date(tour.start_date).toLocaleDateString("vi-VN")}
              </div>
              <div>
                👥 {tour.available_seats}/{tour.max_seats}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-2">Mô tả</h2>
              <p>{tour.description}</p>
            </div>

            {/* ✅ REVIEW FORM (ĐÚNG VỊ TRÍ) */}
            {/* <ReviewForm tourId={tour._id} /> */}
          </div>

          {/* RIGHT */}
          <div>
            <div className="sticky top-8 bg-white p-6 rounded shadow">
              <div className="text-2xl font-bold text-red-500 mb-4">
                {formatPrice(tour.price)} / khách
              </div>

              {/* BOOKING */}
              <BookingForm tourId={tour._id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TourDetailPage;
