import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import tourApi from "../api/tourApi";
import TourCard from "../components/TourCard";
import TourCardHorizontal from "../components/TourCardHorizontal"; // Nhớ thêm dòng này

// Import Swiper React components & styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HomePage = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortType, setSortType] = useState("newest");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    const fetchTours = async () => {
      try {
        const response = await tourApi.getAllTours();
        setTours(response.data);
      } catch (err) {
        setError("Không thể tải danh sách tour.");
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
      navigate("/");
    }
  };

  const processedTours = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = tours.filter((tour) => {
      const startDate = new Date(tour.start_date);
      startDate.setHours(0, 0, 0, 0);
      if (startDate.getTime() <= today.getTime()) return false;

      const matchName = tour.title
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());

      const basePrice = tour.price?.adult || 0;
      const discountMultiplier = 1 - (tour.sale_percentage || 0) / 100;
      const finalPrice = basePrice * discountMultiplier;

      let matchPrice = true;
      if (priceFilter === "under-2") matchPrice = finalPrice < 2000000;
      else if (priceFilter === "2-5")
        matchPrice = finalPrice >= 2000000 && finalPrice <= 5000000;
      else if (priceFilter === "over-5") matchPrice = finalPrice > 5000000;

      return matchName && matchPrice;
    });

    switch (sortType) {
      case "price-asc":
        return filtered.sort(
          (a, b) =>
            (a.price?.adult || 0) * (1 - (a.sale_percentage || 0) / 100) -
            (b.price?.adult || 0) * (1 - (b.sale_percentage || 0) / 100),
        );
      case "price-desc":
        return filtered.sort(
          (a, b) =>
            (b.price?.adult || 0) * (1 - (b.sale_percentage || 0) / 100) -
            (a.price?.adult || 0) * (1 - (a.sale_percentage || 0) / 100),
        );
      case "date-asc":
        return filtered.sort(
          (a, b) => new Date(a.start_date) - new Date(b.start_date),
        );
      default:
        return filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    }
  }, [tours, debouncedSearchTerm, priceFilter, sortType]);

  // --- LOGIC CHIA TOUR THEO VỊ TRÍ (MỚI) ---
  const domesticTours = useMemo(() => {
    return processedTours.filter((t) => t.location_type === "domestic");
  }, [processedTours]);

  const internationalTours = useMemo(() => {
    return processedTours.filter((t) => t.location_type === "international");
  }, [processedTours]);

  const promotionalTours = useMemo(() => {
    return processedTours.filter((t) => (t.sale_percentage || 0) > 0);
  }, [processedTours]);

  const trendingTours = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const available = tours.filter((tour) => new Date(tour.start_date) > today);
    return available
      .sort((a, b) => (a.available_seats || 0) - (b.available_seats || 0))
      .slice(0, 6);
  }, [tours]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <style>{`
                .swiper-button-next, .swiper-button-prev {
                    background-color: white !important;
                    width: 40px !important;
                    height: 40px !important;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    color: #2563eb !important;
                }
                .swiper-button-next:after, .swiper-button-prev:after {
                    font-size: 16px !important;
                }
                .swiper {
                    padding: 10px 10px 50px 10px !important;
                }
            `}</style>

            {/* HEADER */}


            <main className="flex-grow">
                {/* HERO SECTION VỚI KHUNG TÌM KIẾM ĐẦY ĐỦ */}
                <div className="relative h-[500px] bg-blue-900 flex items-center justify-center text-white overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    <div className="relative z-20 text-center px-4 max-w-5xl w-full">
                        <h1 className="text-5xl md:text-6xl font-black mb-6 drop-shadow-2xl">Lên Kế Hoạch Cho Chuyến Đi Tiếp Theo</h1>
                        <p className="text-lg md:text-xl mb-10 font-medium text-blue-100">Khám phá hàng ngàn tour du lịch với mức giá không thể tốt hơn</p>
                        
                        {/* THANH TÌM KIẾM, LỌC & SẮP XẾP - IMPROVED */}
                        <div className="bg-white p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 mx-auto w-full border border-blue-100">
                            {/* TÌM KIẾM */}
                            <div className="flex-1 relative group">
                                <span className="absolute left-4 top-3.5 text-blue-500 text-xl font-bold">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Bạn muốn đi đâu? (VD: Đà Lạt, Sapa...)" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50 font-medium placeholder-gray-500"
                                />
                            </div>
                            
                            {/* LỌC GIÁ */}
                            <div className="w-full md:w-64 relative">
                                <select 
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl text-gray-700 outline-none bg-white border-2 border-orange-300 cursor-pointer hover:border-orange-400 transition font-bold appearance-none"
                                    style={{backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23f97316%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '20px', paddingRight: '36px'}}
                                >
                                    <option value="all">💸 Mọi mức giá</option>
                                    <option value="under-2">💰 Dưới 2 triệu</option>
                                    <option value="2-5">💵 2 - 5 triệu</option>
                                    <option value="over-5">💴 Trên 5 triệu</option>
                                </select>
                            </div>
                            
                            {/* SẮP XẾP */}
                            <div className="w-full md:w-64 relative">
                                <select 
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl text-gray-700 outline-none bg-white border-2 border-orange-300 cursor-pointer hover:border-orange-400 transition font-bold appearance-none"
                                    style={{backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23f97316%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '20px', paddingRight: '36px'}}
                                >
                                    <option value="newest">✨ Tour mới nhất</option>
                                    <option value="price-asc">⬆️ Giá thấp đến cao</option>
                                    <option value="price-desc">⬇️ Giá cao xuống thấp</option>
                                    <option value="date-asc">📅 Khởi hành sớm nhất</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-16">
                    
                    {/* TRẠNG THÁI LOADING / LỖI */}
                    {loading && (
                        <div className="flex justify-center items-center py-20 text-gray-500 text-xl font-medium">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-4"></div>
                            Đang tải danh sách tour...
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-xl text-center font-bold my-10 shadow-sm border border-red-200">{error}</div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* KẾT QUẢ TÌM KIẾM / LỌC (Chỉ hiện khi người dùng dùng thanh tìm kiếm/lọc) */}
                            {(debouncedSearchTerm || priceFilter !== 'all' || sortType !== 'newest') && (
                                <section className="mb-20">
                                    <h2 className="text-3xl font-black text-gray-900 mb-8 border-b-2 border-blue-600 inline-block pb-2">🎯 Kết quả tìm kiếm</h2>
                                    {processedTours.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                            {processedTours.map(tour => (
                                                <div key={tour._id} className="transition-transform hover:-translate-y-2">
                                                    <TourCard tour={tour} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                                            <div className="text-6xl mb-4 grayscale opacity-40">🏜️</div>
                                            <h3 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy chuyến đi nào</h3>
                                            <p className="text-gray-500">Thử thay đổi từ khóa hoặc mức giá xem sao nhé!</p>
                                            <button 
                                                onClick={() => {setSearchTerm(''); setPriceFilter('all'); setSortType('newest');}}
                                                className="mt-4 text-blue-600 font-bold hover:underline"
                                            >
                                                Xóa bộ lọc
                                            </button>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* CHỈ HIỆN MẶC ĐỊNH KHI KHÔNG CÓ BỘ LỌC NÀO ĐƯỢC ÁP DỤNG */}
                            {!debouncedSearchTerm && priceFilter === 'all' && sortType === 'newest' && (
                                <>
                                    {/* SLIDE SIÊU SALE */}
                                    {promotionalTours.length > 0 && (
                                        <section className="mb-24">
                                            <div className="flex flex-col items-center mb-12">
                                                <h2 className="text-4xl font-black text-gray-900">Ưu Đãi Đặc Biệt</h2>
                                                <p className="text-gray-500 mt-2">Nhanh tay đặt ngay kẻo lỡ - Ưu đãi lên đến 50%</p>
                                                <div className="h-1.5 w-32 bg-orange-500 rounded-full mt-4"></div>
                                            </div>

                                            <Swiper
                                                modules={[Navigation, Autoplay, Pagination]}
                                                spaceBetween={30}
                                                slidesPerView={1}
                                                navigation={true}
                                                pagination={{ clickable: true }}
                                                loop={true}
                                                autoplay={{ delay: 4000, disableOnInteraction: false }}
                                                breakpoints={{
                                                    640: { slidesPerView: 2 },
                                                    1024: { slidesPerView: 3 },
                                                }}
                                            >
                                                {promotionalTours.map(tour => (
                                                    <SwiperSlide key={tour._id}>
                                                        <TourCard tour={tour} />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        </section>
                                    )}

                                    {/* TOP CHUYẾN ĐI (Tour sắp hết vé) */}
                                    {trendingTours.length > 0 && (
                                        <section>
                                            <div className="flex flex-col items-center mb-12">
                                                <h2 className="text-4xl font-black text-gray-900 mb-2">Top Chuyến Đi Bán Chạy</h2>
                                                <p className="text-gray-500 mt-2">Những tour được khách hàng yêu thích và đặt nhiều nhất</p>
                                                <div className="h-1.5 w-32 bg-blue-600 rounded-full mt-4"></div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                                {trendingTours.map(tour => (
                                                    <div key={tour._id} className="transition-transform hover:-translate-y-2">
                                                        <TourCard tour={tour} />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* FOOTER */}
        </div>
  );
};

export default HomePage;
