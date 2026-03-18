import React, { useState, useEffect } from 'react';
import tourApi from '../api/tourApi';
import TourCard from '../components/TourCard';

const HomePage = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Chạy duy nhất 1 lần khi trang được tải
    useEffect(() => {
        const fetchTours = async () => {
            try {
                // Gọi API lấy tất cả tour
                const response = await tourApi.getAllTours();
                // tourApi.js (axiosClient) đã được cấu hình trả về response.data
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header đơn giản */}
            <header className="bg-white shadow-sm sticky top-0 z-10 border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-blue-600">Travel<span className="text-orange-500">Go</span></h1>
                    <nav className="space-x-4 text-sm font-medium">
                        <a href="/admin/add-tour" className="text-gray-600 hover:text-blue-600 border px-3 py-1.5 rounded-md bg-gray-100">Vào Admin</a>
                    </nav>
                </div>
            </header>

            {/* Nội dung chính */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-10 border-b pb-6">
                    <h2 className="text-4xl font-bold text-gray-800">Khám phá các Tour Du Lịch Hot Nhất</h2>
                    <p className="text-gray-600 mt-2 text-lg">Tìm kiếm chuyến đi mơ ước của bạn ngay hôm nay</p>
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

                {/* Hiển thị Grid Tour - Grid 3 cột trên PC, 1 cột trên điện thoại */}
                {!loading && !error && tours.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tours.map((tour) => (
                            <TourCard key={tour._id} tour={tour} />
                        ))}
                    </div>
                )}

                {/* Trường hợp không có tour nào */}
                {!loading && !error && tours.length === 0 && (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-inner">
                        <p className="text-2xl font-bold">Hiện chưa có tour nào.</p>
                        <p className="mt-2">Hãy vào trang Admin để thêm tour mới!</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-300 mt-20 py-10 text-center text-sm border-t-4 border-blue-600">
                <p>&copy; 2026 TravelGo. Tất cả các quyền được bảo lưu.</p>
                <p className="mt-1">Dự án được xây dựng bởi Team của Bạn.</p>
            </footer>
        </div>
    );
};

export default HomePage;