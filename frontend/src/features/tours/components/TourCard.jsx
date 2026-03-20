import React from 'react';
import { Link } from 'react-router-dom';

const TourCard = ({ tour }) => {
    // Hàm format tiền tệ VNĐ
    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Hàm tính giá sau khi giảm (nếu có sale)
    const calcSalePrice = (price, sale_percentage) => {
        if (!sale_percentage) return price;
        return price * (1 - sale_percentage / 100);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full relative group">
            
            {/* KHU VỰC HÌNH ẢNH */}
            <div className="relative overflow-hidden">
                {/* 1. SỬA LỖI ẢNH: Lấy ảnh đầu tiên trong mảng images */}
                <img 
                    src={tour.images && tour.images.length > 0 ? tour.images[0] : 'https://placehold.co/600x400?text=No+Image'} 
                    alt={tour.title} 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badge % Giảm giá (Chỉ hiện khi sale > 0) */}
                {tour.sale_percentage > 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg z-10 animate-bounce">
                        GIẢM {tour.sale_percentage}%
                    </div>
                )}
                
                <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-4 py-1.5 rounded-tr-xl text-sm font-bold shadow-md z-10">
                    {tour.duration}
                </div>
            </div>

            {/* KHU VỰC NỘI DUNG */}
            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {tour.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {tour.description}
                </p>
                
                <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-600 font-medium">📅 Khởi hành:</span>
                        <span className="font-bold text-blue-700">{new Date(tour.start_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg border-b-2 border-transparent">
                        <span className="text-gray-600 font-medium">🪑 Còn trống:</span>
                        <span className="font-bold text-orange-600">{tour.available_seats} / {tour.max_seats} vé</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3">
                        {/* 2. SỬA LỖI GIÁ: Trỏ thẳng vào giá người lớn (price.adult) */}
                        <div>
                            {tour.sale_percentage > 0 ? (
                                <>
                                    <p className="text-xs text-gray-400 line-through mb-0.5">{formatPrice(tour.price?.adult)}</p>
                                    <p className="text-lg font-black text-red-600">{formatPrice(calcSalePrice(tour.price?.adult, tour.sale_percentage))}</p>
                                </>
                            ) : (
                                <p className="text-lg font-black text-blue-600">{formatPrice(tour.price?.adult)}</p>
                            )}
                        </div>
                        
                        {/* 3. SỬA LỖI ROUTING: Bắt buộc truyền _id để trang Chi tiết bắt được */}
                        <Link 
                            to={`/tours/${tour.slug}`} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Xem Chi Tiết
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourCard;