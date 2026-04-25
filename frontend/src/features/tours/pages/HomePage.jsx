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
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <Link
            to="/"
            className="text-3xl font-black text-blue-600 tracking-tighter"
          >
            Travel<span className="text-orange-500">oke</span>
          </Link>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-blue-50 p-1.5 pr-4 rounded-full border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {currentUser.full_name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {currentUser.full_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-xs font-black text-red-500 hover:text-red-700"
                >
                  ĐĂNG XUẤT
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-all"
              >
                ĐĂNG NHẬP
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* HERO SECTION */}
        <div className="relative h-[400px] bg-blue-900 flex items-center justify-center text-white overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            alt="banner"
          />
          <div className="relative z-20 text-center px-4 max-w-4xl w-full">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Khám Phá Thế Giới Cùng Traveloke
            </h1>
            <div className="bg-white p-2 rounded-xl shadow-2xl flex flex-col md:flex-row gap-2 mx-auto w-full mt-8">
              <input
                type="text"
                placeholder="Bạn muốn đi đâu?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 text-gray-800 outline-none bg-transparent font-medium"
              />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-2 text-gray-700 outline-none border-l border-gray-200"
              >
                <option value="all">Mọi mức giá</option>
                <option value="under-2">Dưới 2 triệu</option>
                <option value="2-5">2 - 5 triệu</option>
                <option value="over-5">Trên 5 triệu</option>
              </select>
              <button className="bg-orange-500 text-white px-8 py-2 rounded-lg font-bold hover:bg-orange-600 transition-all">
                TÌM KIẾM
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading && (
            <div className="text-center py-20 font-bold text-blue-600">
              Đang tải dữ liệu...
            </div>
          )}
          {error && (
            <div className="text-center py-20 text-red-500 font-bold">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* PHẦN CHIA CỘT KIỂU SAIGONTOURIST */}
              {!debouncedSearchTerm && priceFilter === "all" && (
                <section className="mb-24 mt-10">
                  <div className="flex flex-col items-center mb-12">
                    <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter italic">
                      VI VU THẾ GIỚI CÙNG TRAVELOKE
                    </h2>
                    <div className="h-1.5 w-32 bg-orange-500 rounded-full mt-3 shadow-sm"></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* CỘT 1: TOUR TRONG NƯỚC */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-blue-700 rounded-full shadow-sm"></div>
                        <h3 className="text-2xl font-black text-blue-800 uppercase tracking-tight">
                          Tour trong nước
                        </h3>
                      </div>
                      <div className="flex flex-col gap-6">
                        {domesticTours.length > 0 ? (
                          domesticTours
                            .slice(0, 4)
                            .map((tour) => (
                              <TourCardHorizontal key={tour._id} tour={tour} />
                            ))
                        ) : (
                          <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 italic">
                            Đang cập nhật tour trong nước...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CỘT 2: TOUR NƯỚC NGOÀI */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-orange-600 rounded-full shadow-sm"></div>
                        <h3 className="text-2xl font-black text-orange-700 uppercase tracking-tight">
                          Tour nước ngoài
                        </h3>
                      </div>
                      <div className="flex flex-col gap-6">
                        {internationalTours.length > 0 ? (
                          internationalTours
                            .slice(0, 4)
                            .map((tour) => (
                              <TourCardHorizontal key={tour._id} tour={tour} />
                            ))
                        ) : (
                          <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 italic bg-gray-50/50">
                            Hệ thống đang cập nhật tour quốc tế mới...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* CÁC PHẦN KHÁC (SALE, TRENDING) GIỮ NGUYÊN HOẶC LỌC KẾT QUẢ TÌM KIẾM */}
              {debouncedSearchTerm || priceFilter !== "all" ? (
                <section>
                  <h2 className="text-2xl font-black mb-8">
                    🎯 Kết quả tìm kiếm
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {processedTours.map((tour) => (
                      <TourCard key={tour._id} tour={tour} />
                    ))}
                  </div>
                </section>
              ) : (
                <>
                  {/* Swiper cho các tour khuyến mãi */}
                  <section className="mb-20">
                    <h2 className="text-2xl font-black mb-6">
                      🔥 Đang Khuyến Mãi
                    </h2>
                    <Swiper
                      modules={[Navigation, Pagination, Autoplay]}
                      spaceBetween={20}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      breakpoints={{ 768: { slidesPerView: 3 } }}
                    >
                      {promotionalTours.map((tour) => (
                        <SwiperSlide key={tour._id}>
                          <TourCard tour={tour} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12 text-center border-t-4 border-blue-600">
        <p className="text-sm font-bold uppercase tracking-widest">
          © 2026 TRAVELOKE - PHÁT TRIỂN BỞI SINH VIÊN IUH
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
