import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import tourApi from "../api/tourApi";
import BookingForm from "../../bookings/components/BookingForm";
// import ReviewForm from "../../reviews/components/ReviewForm";

const TourDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Lỗi đọc thông tin user", e);
        }
      }
    };
    checkLoginStatus();

    const fetchTourDetail = async () => {
      try {
        const response = await tourApi.getTourBySlug(slug);
        const tourData = response.data || response;
        setTour(tourData);

        if (tourData.images?.length > 0) {
          setMainImage(tourData.images[0]);
        } else if (tourData.image_url) {
          setMainImage(tourData.image_url);
        } else {
          setMainImage("https://placehold.co/800x500?text=No+Image");
        }
      } catch (err) {
        setError("Không thể tải thông tin chuyến đi. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchTourDetail();
  }, [slug]);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
      navigate("/");
    }
  };

  // Helper format giá linh hoạt
  const formatPrice = (priceValue) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(priceValue || 0);
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 text-xl font-bold text-blue-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mr-4"></div>
        Đang tải thông tin Tour...
      </div>
    );

  if (error || !tour)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-red-100 text-red-700 p-8 rounded-xl font-bold shadow-lg">
          {error || "Tour không tồn tại!"}
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 flex flex-col">
      {/* Header */}
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
                                
                                {/* ✅ ĐÃ THÊM NÚT LỊCH SỬ ĐẶT TOUR Ở ĐÂY */}
                                <Link to="/my-bookings" className="text-gray-600 hover:text-blue-600 font-bold px-2 flex items-center gap-1">
                                    <span>✈️</span> Lịch sử đặt tour
                                </Link>

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

      {/* Breadcrumb */}
      <div className="bg-blue-600 text-white py-3 shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 text-sm font-medium">
          <Link to="/" className="hover:underline text-blue-100">
            ← Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="opacity-75">{tour.title}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: CHI TIẾT TOUR */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <img
                src={mainImage}
                alt={tour.title}
                className="w-full h-80 md:h-[450px] object-cover rounded-xl mb-4 transition-all"
              />
              <div className="flex gap-3 overflow-x-auto pb-2">
                {tour.images?.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="thumb"
                    onClick={() => setMainImage(img)}
                    className={`h-20 w-28 object-cover rounded-lg cursor-pointer border-2 transition-all shrink-0 ${mainImage === img ? "border-blue-600" : "border-transparent opacity-60 hover:opacity-100"}`}
                  />
                ))}
              </div>
            </div>

            {/* Title & Info */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border-l-4 border-l-blue-600">
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-6 leading-tight">
                {tour.title}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Thời lượng
                    </p>
                    <p className="font-bold">{tour.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Khởi hành
                    </p>
                    <p className="text-blue-600 font-bold">
                      {new Date(tour.start_date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                  <span className="text-xl">🪑</span>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Chỗ trống
                    </p>
                    <p className="text-orange-600 font-bold">
                      {tour.available_seats} / {tour.max_seats} vé
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mô tả & Lịch trình */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border">
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                📝 Tổng quan
              </h2>
              <p className="text-gray-600 whitespace-pre-line text-justify">
                {tour.description}
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border">
              <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                🗺️ Lịch trình
              </h2>
              <div className="space-y-6">
                {tour.itinerary?.map((day, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center">
                        D{index + 1}
                      </div>
                      {index !== tour.itinerary.length - 1 && (
                        <div className="w-1 h-full bg-blue-100 mt-2"></div>
                      )}
                    </div>
                    <div className="pb-8 flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {day.title}
                      </h3>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border leading-relaxed">
                        {day.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* <ReviewForm tourId={tour._id} /> */}
          </div>

          {/* CỘT PHẢI: BẢNG GIÁ & BOOKING */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-orange-500 sticky top-24">
              {tour.sale_percentage > 0 && (
                <div className="absolute -top-4 -right-2 bg-red-600 text-white font-black px-4 py-2 rounded-full shadow-lg transform rotate-3">
                  GIẢM {tour.sale_percentage}%
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-2">
                Bảng Giá Vé
              </h3>

              <div className="space-y-5 mb-8">
                {/* Giá Người lớn */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-700">Người lớn</p>
                    <p className="text-[10px] text-gray-400 italic">
                      Trên 12 tuổi
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-blue-700">
                      {formatPrice(tour.price?.adult)}
                    </p>
                  </div>
                </div>

                {/* Giá Trẻ em */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-700">Trẻ em</p>
                    <p className="text-[10px] text-gray-400 italic">
                      2 - 12 tuổi
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">
                      {formatPrice(tour.price?.child)}
                    </p>
                  </div>
                </div>

                {/* Giá Em bé */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-700 text-green-700">
                      Em bé
                    </p>
                    <p className="text-[10px] text-gray-400 italic">
                      Dưới 2 tuổi
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {tour.price?.infant > 0
                        ? formatPrice(tour.price.infant)
                        : "Miễn phí"}
                    </p>
                  </div>
                </div>
              </div>

              {/* KHU VỰC FORM ĐẶT VÉ & KIỂM TRA TRẠNG THÁI HẾT VÉ */}
              <div className="mt-6 border-t pt-6">
                {tour.available_seats <= 0 ? (
                  // TÌNH HUỐNG 1: ĐÃ HẾT VÉ (Sold Out) -> Ẩn form, ẩn nút, hiện thông báo
                  <div className="bg-[#f7ece3] border border-[#e8d6c8] p-5 rounded-xl text-center shadow-inner">
                    <p className="text-[#a0522d] text-sm font-bold leading-relaxed">
                      Hiện số chỗ của ngày khởi hành Quý khách tham khảo đang tạm kín chỗ. Vui lòng liên hệ với nhân viên.
                    </p>
                    <div className="mt-4 inline-block bg-white px-6 py-2 rounded-full border border-[#e8d6c8] text-[#a0522d] font-black text-sm shadow-sm">
                      📞 Hotline: 1900 1234
                    </div>
                  </div>
                ) : currentUser ? (
                  // TÌNH HUỐNG 2: CÒN VÉ & ĐÃ ĐĂNG NHẬP -> Hiện Form của đồng đội
                  <BookingForm tour={tour} />
                ) : (
                  // TÌNH HUỐNG 3: CÒN VÉ & CHƯA ĐĂNG NHẬP -> Bắt đăng nhập
                  <button 
                    onClick={() => {
                      alert('🔒 Bạn chưa đăng nhập. Vui lòng đăng nhập để tiến hành đặt tour!');
                      navigate('/auth', { state: { from: `/tours/${slug}` } });
                    }}
                    className="w-full py-4 bg-gray-400 hover:bg-gray-500 text-white font-black text-xl rounded-xl shadow-lg transition"
                  >
                    ĐĂNG NHẬP ĐỂ ĐẶT VÉ
                  </button>
                )}
              </div>

              <p className="text-center text-[11px] text-gray-400 mt-6 italic">
                Hoàn tiền 100% nếu hủy trước 7 ngày. Hỗ trợ 24/7.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TourDetailPage;
