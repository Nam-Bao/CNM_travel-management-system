import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tourApi from '../api/tourApi';
import TourCard from '../components/TourCard';

// Import Swiper React components & styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HomePage = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    
    // --- CÁC STATE CHO TÌM KIẾM, LỌC & SẮP XẾP ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounce state
    const [priceFilter, setPriceFilter] = useState('all');
    const [sortType, setSortType] = useState('newest');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));

        const fetchTours = async () => {
            try {
                const response = await tourApi.getAllTours();
                setTours(response.data);
            } catch (err) {
                setError('Không thể tải danh sách tour.');
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    // --- LOGIC DEBOUNCE THÔNG MINH ---
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
            navigate('/');
        }
    };

    // --- LOGIC LỌC TỔNG HỢP (Ngày + Giá + Từ khóa) & SẮP XẾP ---
    const processedTours = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = tours.filter(tour => {
            // 1. Chỉ lấy tour chưa khởi hành
            const startDate = new Date(tour.start_date);
            startDate.setHours(0, 0, 0, 0);
            if (startDate.getTime() <= today.getTime()) return false;

            // 2. Lọc theo từ khóa (dùng debounced)
            const matchName = tour.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            // 3. Lọc theo giá
            const basePrice = tour.price?.adult || 0;
            const discountMultiplier = 1 - (tour.sale_percentage || 0) / 100;
            const finalPrice = basePrice * discountMultiplier; 

            let matchPrice = true;
            if (priceFilter === 'under-2') matchPrice = finalPrice < 2000000;
            else if (priceFilter === '2-5') matchPrice = finalPrice >= 2000000 && finalPrice <= 5000000;
            else if (priceFilter === 'over-5') matchPrice = finalPrice > 5000000;

            return matchName && matchPrice;
        });

        // 4. Sắp xếp (Sort)
        switch (sortType) {
            case 'price-asc': // Giá thấp đến cao
                return filtered.sort((a, b) => {
                    const priceA = (a.price?.adult || 0) * (1 - (a.sale_percentage || 0) / 100);
                    const priceB = (b.price?.adult || 0) * (1 - (b.sale_percentage || 0) / 100);
                    return priceA - priceB;
                });
            case 'price-desc': // Giá cao xuống thấp
                return filtered.sort((a, b) => {
                    const priceA = (a.price?.adult || 0) * (1 - (a.sale_percentage || 0) / 100);
                    const priceB = (b.price?.adult || 0) * (1 - (b.sale_percentage || 0) / 100);
                    return priceB - priceA;
                });
            case 'date-asc': // Khởi hành sớm nhất
                return filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            default: // Mới nhất (newest)
                return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }, [tours, debouncedSearchTerm, priceFilter, sortType]);

    // --- PHÂN LOẠI TOUR ---
    // Lấy ra các tour có sale từ danh sách đã qua bộ lọc
    const promotionalTours = useMemo(() => {
        return processedTours.filter(t => (t.sale_percentage || 0) > 0);
    }, [processedTours]);

    // Lấy top 6 tour sắp cháy vé (không phụ thuộc vào bộ lọc tìm kiếm/sắp xếp của người dùng)
    const trendingTours = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const available = tours.filter(tour => new Date(tour.start_date) > today);
        return available
            .sort((a, b) => (a.available_seats || 0) - (b.available_seats || 0))
            .slice(0, 6);
    }, [tours]);


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <style>{`
                /* TỐI ƯU NÚT SLIDE: Trong suốt 100%, rõ nét */
                .swiper-button-next, .swiper-button-prev {
                    background-color: white !important;
                    width: 50px !important;
                    height: 50px !important;
                    border-radius: 50%;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    color: #2563eb !important;
                    opacity: 1 !important; /* Độ trong suốt 100% */
                    border: 1px solid #e5e7eb;
                }
                .swiper-button-next:after, .swiper-button-prev:after {
                    font-size: 20px !important;
                    font-weight: 900;
                }
                /* Để nút bấm không bị mất khi slide chạy */
                .swiper-button-disabled {
                    opacity: 0.3 !important;
                }
                .swiper {
                    padding: 20px 15px 60px 15px !important;
                }
            `}</style>

            {/* HEADER */}
            <header className="bg-white shadow-sm sticky top-0 z-50 border-b h-24 flex items-center">
                <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
                    <Link to="/" className="text-4xl font-black text-blue-600 tracking-tighter hover:scale-105 transition-transform">
                        Travel<span className="text-orange-500">oke</span>
                    </Link>
                    
                    <div className="flex items-center gap-6">
                        {currentUser ? (
                            <div className="flex items-center gap-4 bg-blue-50 p-2 pr-5 rounded-full border border-blue-100 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                    {currentUser.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">Thành viên</span>
                                    <span className="text-sm font-extrabold text-gray-800">{currentUser.full_name}</span>
                                </div>
                                <button onClick={handleLogout} className="ml-4 p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition shadow-sm">
                                    ĐĂNG XUẤT
                                </button>
                            </div>
                        ) : (
                            <Link to="/auth" className="bg-blue-600 text-white px-8 py-3 rounded-full font-black hover:bg-blue-700 hover:shadow-xl transition-all">
                                ĐĂNG NHẬP
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* HERO SECTION VỚI KHUNG TÌM KIẾM ĐẦY ĐỦ */}
                <div className="relative h-[500px] bg-blue-900 flex items-center justify-center text-white overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    <div className="relative z-20 text-center px-4 max-w-5xl w-full">
                        <h1 className="text-5xl md:text-6xl font-black mb-6 drop-shadow-2xl">Lên Kế Hoạch Cho Chuyến Đi Tiếp Theo</h1>
                        <p className="text-lg md:text-xl mb-10 font-medium text-blue-100">Khám phá hàng ngàn tour du lịch với mức giá không thể tốt hơn</p>
                        
                        {/* THANH TÌM KIẾM, LỌC & SẮP XẾP */}
                        <div className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 mx-auto w-full">
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-3.5 text-gray-400 text-lg">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Bạn muốn đi đâu? (VD: Đà Lạt, Sapa...)" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-200 transition bg-gray-50 font-medium"
                                />
                            </div>
                            <div className="w-full md:w-56">
                                <select 
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-gray-700 outline-none bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 font-medium"
                                >
                                    <option value="all">💸 Mọi mức giá</option>
                                    <option value="under-2">Dưới 2 triệu</option>
                                    <option value="2-5">Từ 2 - 5 triệu</option>
                                    <option value="over-5">Trên 5 triệu</option>
                                </select>
                            </div>
                            <div className="w-full md:w-56">
                                <select 
                                    value={sortType}
                                    onChange={(e) => setSortType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-blue-700 outline-none bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100 font-bold"
                                >
                                    <option value="newest">✨ Tour mới nhất</option>
                                    <option value="price-asc">Giá thấp đến cao</option>
                                    <option value="price-desc">Giá cao xuống thấp</option>
                                    <option value="date-asc">Khởi hành sớm nhất</option>
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
            <footer className="bg-gray-900 text-white pt-20 pb-10 border-t-8 border-blue-600">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-gray-800">
                    <div className="col-span-1">
                        <h3 className="text-3xl font-black text-blue-500 mb-6">Traveloke</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Hệ thống đặt tour du lịch thông minh dành cho sinh viên và gia đình. Uy tín - Tiết kiệm - Nhanh chóng.</p>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-lg mb-6">Về Traveloke</h4>
                        <ul className="text-gray-400 text-sm space-y-4 font-medium">
                            <li className="hover:text-blue-400 cursor-pointer transition">Về chúng tôi</li>
                            <li className="hover:text-blue-400 cursor-pointer transition">Hướng dẫn đặt tour</li>
                            <li className="hover:text-blue-400 cursor-pointer transition">Blog du lịch</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-lg mb-6">Hỗ Trợ Khách Hàng</h4>
                        <ul className="text-gray-400 text-sm space-y-4 font-medium">
                            <li className="hover:text-blue-400 cursor-pointer transition">Trung tâm trợ giúp</li>
                            <li>Hotline: <span className="text-blue-400">1900 1234</span></li>
                            <li>Email: <span className="text-blue-400">support@traveloke.vn</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-lg mb-6">Cơ Sở Đào Tạo</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            📍 Industrial University of Ho Chi Minh City (IUH)<br/>
                            12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, HCM.
                        </p>
                    </div>
                </div>
                <div className="mt-10 text-center">
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">© 2026 TRAVELOKE PLATFORM - PHÁT TRIỂN BỞI SINH VIÊN IUH</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;