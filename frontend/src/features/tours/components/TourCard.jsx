import React from "react";
import { Link } from "react-router-dom";

const TourCard = ({ tour }) => {
  const isTourEnded = new Date(tour.start_date) < new Date();

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calcSalePrice = (price, sale_percentage) => {
    if (!sale_percentage) return price;
    return price * (1 - sale_percentage / 100);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full relative group ${isTourEnded ? "opacity-95" : ""}`}
    >
      {/* KHU VỰC HÌNH ẢNH */}
      <div className="relative overflow-hidden h-56">
        
        {/* --- BADGE GIẢM GIÁ (GÓC TRÁI) --- */}
        {tour.sale_percentage > 0 && !isTourEnded && (
          <div className="absolute top-3 left-3 z-30 bg-red-600 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-lg animate-pulse">
            GIẢM {tour.sale_percentage}%
          </div>
        )}

        {/* --- BADGE SỐ CHỖ (GÓC PHẢI) --- */}
        {tour.available_seats !== undefined && !isTourEnded && (
          <div className="absolute top-3 right-3 z-30 bg-white/95 backdrop-blur-sm text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
            CÒN {tour.available_seats} CHỖ
          </div>
        )}

        <img
          src={
            tour.images && tour.images.length > 0
              ? tour.images[0]
              : "https://placehold.co/600x400?text=No+Image"
          }
          alt={tour.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${isTourEnded ? "grayscale-[30%]" : "group-hover:scale-110"}`}
        />

        {/* LỚP PHỦ VÀ CHỮ "ĐÃ KẾT THÚC" */}
        {isTourEnded && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <div className="bg-gray-800/90 text-white border border-gray-500 px-6 py-2 rounded-lg font-black tracking-widest uppercase transform -rotate-12 text-xl shadow-2xl backdrop-blur-sm">
              Đã Kết Thúc
            </div>
          </div>
        )}

        {/* THỜI LƯỢNG TOUR */}
        <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-4 py-1.5 rounded-tr-xl text-sm font-bold shadow-md z-10">
          {tour.duration}
        </div>
      </div>

      {/* KHU VỰC NỘI DUNG (Giữ nguyên phần dưới của bạn) */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className={`text-xl font-bold mb-2 line-clamp-2 transition-colors ${isTourEnded ? "text-gray-500" : "text-gray-800 hover:text-blue-600"}`}>
          {tour.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {tour.description}
        </p>

        <div className="mt-auto space-y-3">
          {/* ... Các phần thông tin ngày đi, còn trống và giá tiền giữ nguyên như code của bạn ... */}
          <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
            <span className="text-gray-600 font-medium">📅 Khởi hành:</span>
            <span className={`font-bold ${isTourEnded ? "text-gray-400 line-through" : "text-blue-700"}`}>
              {new Date(tour.start_date).toLocaleDateString("vi-VN")}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
            <span className="text-gray-600 font-medium">🪑 Tổng chỗ:</span>
            <span className="font-bold text-gray-700">{tour.max_seats} vé</span>
          </div>

          <div className="flex justify-between items-center pt-3 gap-2">
            <div>
              {tour.sale_percentage > 0 ? (
                <>
                  <p className="text-xs text-gray-400 line-through mb-0.5">{formatPrice(tour.price?.adult)}</p>
                  <p className={`text-lg font-black ${isTourEnded ? "text-gray-400" : "text-red-600"}`}>
                    {formatPrice(calcSalePrice(tour.price?.adult, tour.sale_percentage))}
                  </p>
                </>
              ) : (
                <p className={`text-lg font-black ${isTourEnded ? "text-gray-400" : "text-blue-600"}`}>
                  {formatPrice(tour.price?.adult)}
                </p>
              )}
            </div>

            <Link
              to={`/tours/${tour.slug}`}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all transform flex items-center justify-center gap-1.5 whitespace-nowrap group-hover:shadow-md ${
                isTourEnded
                  ? "border-2 border-green-600 text-green-700 bg-green-50/70 hover:bg-green-100"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5"
              }`}
            >
              {isTourEnded ? "Xem Đánh Giá" : "Xem Chi Tiết"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourCard;