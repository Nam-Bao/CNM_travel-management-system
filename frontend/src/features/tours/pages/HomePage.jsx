import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import tourApi from '../api/tourApi';
import TourCard from '../components/TourCard';

const HomePage = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 1. State cho bộ lọc và tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');

    // Chạy duy nhất 1 lần khi trang được tải
    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await tourApi.getAllTours();
                setTours(response.data); 
            } catch (err) {
                console.error('Lỗi lấy tour:', err);
                setError('Không thể tải danh sách tour. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    // 2. LOGIC LỌC TOUR (Chạy ngầm mỗi khi gõ chữ hoặc chọn giá)
    const filteredTours = tours.filter(tour => {
        // Lọc theo tên
        const matchName = tour.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Lọc theo giá
        let matchPrice = true;
        if (priceFilter === 'under-2') matchPrice = tour.price < 2000000;
        else if (priceFilter === '2-5') matchPrice = tour.price >= 2000000 && tour.price <= 5000000;
        else if (priceFilter === 'over-5') matchPrice = tour.price > 5000000;

        return matchName && matchPrice;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-3xl font-extrabold text-blue-600">
                        Travel<span className="text-orange-500">oke</span>
                    </Link>
                    <nav className="space-x-4 text-sm font-medium">
                        <Link 
                            to="/auth"  
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md text-sm block text-center"
                        >
                            Đăng nhập
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Nội dung chính */}
            <main className="max-w-7xl mx-auto px-4 py-12 flex-grow w-full">
                
                {/* Hero Section & Thanh Tìm Kiếm */}
                <div className="mb-12 bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Khám phá thế giới cùng Traveloke</h2>
                        <p className="text-lg text-blue-100 mb-8">Tìm kiếm chuyến đi mơ ước của bạn ngay hôm nay với giá tốt nhất</p>
                        
                        {/* Thanh công cụ Search & Filter */}
                        <div className="max-w-3xl mx-auto bg-white p-2 rounded-xl shadow-xl flex flex-col md:flex-row gap-2">
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Bạn muốn đi đâu? (VD: Đà Lạt, Sapa...)" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <select 
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg text-gray-700 outline-none bg-gray-50 border-none cursor-pointer hover:bg-gray-100"
                                >
                                    <option value="all">💸 Mọi mức giá</option>
                                    <option value="under-2">Dưới 2 triệu</option>
                                    <option value="2-5">Từ 2 - 5 triệu</option>
                                    <option value="over-5">Trên 5 triệu</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Họa tiết trang trí nền */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500 opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-blue-700 opacity-50 blur-2xl"></div>
                </div>

                {/* Trạng thái Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-20 text-gray-500 text-xl font-medium">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-4"></div>
                        Đang tải danh sách tour...
                    </div>
                )}

                {/* Trạng thái Error */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center font-medium my-10">
                        {error}
                    </div>
                )}

                {/* Hiển thị Grid Tour */}
                {!loading && !error && (
                    <>
                        {filteredTours.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredTours.map((tour) => (
                                    <TourCard key={tour._id} tour={tour} />
                                ))}
                            </div>
                        ) : (
                            // Giao diện khi tìm kiếm không ra kết quả
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <div className="text-6xl mb-4">🏜️</div>
                                <h3 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy chuyến đi nào</h3>
                                <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc mức giá xem sao nhé!</p>
                                <button 
                                    onClick={() => {setSearchTerm(''); setPriceFilter('all')}}
                                    className="mt-4 text-blue-600 font-bold hover:underline"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-300 py-10 text-center text-sm border-t-4 border-blue-600 mt-auto">
                <p>&copy; 2026 Traveloke. Tất cả các quyền được bảo lưu.</p>
                <p className="mt-1">Nền tảng đặt tour du lịch hàng đầu.</p>
            </footer>
        </div>
    );
};

export default HomePage;