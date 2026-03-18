import React from 'react';
import { Link } from 'react-router-dom';
const TourCard = ({ tour }) => {
    // Hàm format giá tiền sang VNĐ cho đẹp
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Hàm format ngày tháng sang chuẩn Việt Nam
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
            {/* Hình ảnh Tour - Có hiệu ứng zoom nhẹ khi hover */}
            <div className="relative h-56 overflow-hidden">
                <img 
                    src={tour.image_url || 'https://placehold.co/400x300/e2e8f0/475569?text=Chua+Co+Anh'}
                    alt={tour.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-4 py-1 text-sm font-bold rounded-tr-lg">
                    {tour.duration}
                </div>
            </div>

            {/* Nội dung Tour */}
            <div className="p-5 space-y-3">
                <h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                    {tour.title}
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-2">
                    {tour.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 gap-2 border-t pt-3">
                    <span className="font-medium text-gray-700">Khởi hành:</span> 
                    {formatDate(tour.start_date)}
                </div>

                <div className="flex justify-between items-center border-t pt-3">
                    <div className="text-sm text-gray-500">
                        Còn trống: <span className="font-bold text-green-600">{tour.available_seats} / {tour.max_seats}</span> vé
                    </div>
                </div>
            </div>

            {/* Phần Giá và nút đặt - Cố định ở dưới cùng */}
            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t mt-auto">
                <span className="text-2xl font-extrabold text-red-500">
                    {formatPrice(tour.price)}
                </span>
            <Link 
                to={`/tours/${tour.slug}`} 
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md text-sm block text-center"
            >
                Xem Chi Tiết
            </Link>
            </div>
        </div>
    );
};

export default TourCard;