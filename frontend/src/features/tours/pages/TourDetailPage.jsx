import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import tourApi from '../api/tourApi';

const TourDetailPage = () => {
    const { slug } = useParams(); // Lấy tên tour từ thanh địa chỉ URL
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await tourApi.getTourBySlug(slug);
                setTour(response.data);
            } catch (err) {
                console.error(err);
                setError('Không thể tải thông tin chi tiết tour này.');
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [slug]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) return <div className="text-center py-20 text-xl font-medium text-gray-500">Đang tải thông tin chuyến đi...</div>;
    if (error) return <div className="text-center py-20 text-red-500 font-bold text-xl">{error}</div>;
    if (!tour) return <div className="text-center py-20 text-gray-500">Không tìm thấy tour.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header đơn giản (Giống HomePage) */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-3xl font-extrabold text-blue-600">Travel<span className="text-orange-500">Go</span></Link>
                    <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">← Quay lại trang chủ</Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 mt-8">
                {/* Tiêu đề chính */}
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{tour.title}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* CỘT TRÁI: Phần hiển thị thông tin của BẠN (Chiếm 2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Ảnh bìa */}
                        <div className="rounded-2xl overflow-hidden shadow-lg h-96">
                            <img 
                                src={tour.image_url || 'https://placehold.co/800x400/e2e8f0/475569?text=Chua+Co+Anh'}
                                alt={tour.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Các thông số nhanh */}
                        <div className="flex flex-wrap gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                                ⏱️ {tour.duration}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                                📅 Khởi hành: {new Date(tour.start_date).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-medium">
                                👥 Còn trống: {tour.available_seats} / {tour.max_seats}
                            </div>
                        </div>

                        {/* Mô tả chi tiết */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">📝 Lịch trình chi tiết</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                                {tour.description}
                            </p>
                        </div>
                    </div>

                    {/* CỘT PHẢI: Bãi đáp cho ĐỒNG ĐỘI làm Form Booking (Chiếm 1/3) */}
                    <div className="lg:col-span-1">
                        {/* Kỹ thuật sticky giúp form luôn trượt theo màn hình */}
                        <div className="sticky top-8 bg-white p-6 rounded-xl shadow-2xl border-t-4 border-blue-600">
                            <div className="text-3xl font-black text-red-500 mb-6">
                                {formatPrice(tour.price)} <span className="text-sm text-gray-500 font-normal">/ khách</span>
                            </div>

                            {/* Lời nhắn gửi đồng đội */}
                            <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-8 text-center mt-6">
                                <h3 className="text-lg font-bold text-gray-500 mb-2">ĐỒNG ĐỘI ƠI!</h3>
                                <p className="text-sm text-gray-400">
                                    Hãy xóa cái khung này đi và nhúng Component <strong>`BookingForm.jsx`</strong> của ông vào đây nhé!
                                </p>
                                <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3 rounded-md mt-4 cursor-not-allowed">
                                    Nút Đặt Tour Tạm Thời
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TourDetailPage;