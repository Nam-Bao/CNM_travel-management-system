import React from "react";
import { Link } from "react-router-dom";

const TourCardHorizontal = ({ tour }) => {
  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const finalPrice =
    tour.price?.adult * (1 - (tour.sale_percentage || 0) / 100);

  return (
    <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all h-[200px] group relative w-full">
      {/* 1. KHU VỰC HÌNH ẢNH (Bên trái) */}
      <div className="min-w-[40%] w-[40%] relative overflow-hidden bg-gray-100">
        <img
          src={tour.images?.[0] || "https://placehold.co/400x300?text=No+Image"}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Chỉ giữ lại Badge giảm giá ở góc trên */}
        {tour.sale_percentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-10">
            -{tour.sale_percentage}%
          </div>
        )}

        {/* ĐÃ XÓA DẢI BĂNG ĐỎ Ở ĐÂY */}
      </div>

      {/* 2. KHU VỰC NỘI DUNG (Bên phải) */}
      <div className="w-[60%] p-4 flex flex-col">
        <div className="flex-grow">
          <h4 className="font-extrabold text-gray-800 uppercase text-[13px] line-clamp-2 mb-2 leading-tight h-[32px] overflow-hidden group-hover:text-blue-600 transition-colors">
            {tour.title}
          </h4>

          <div className="text-[11px] text-gray-500 space-y-1.5 mt-2">
            <p className="flex items-center gap-1.5 italic">
              📍 <span className="text-gray-600">Xuất phát:</span>{" "}
              <span className="text-gray-800 font-semibold">
                TP. Hồ Chí Minh
              </span>
            </p>
            <p className="flex items-center gap-1.5 italic">
              🗓 <span className="text-gray-600">Khởi hành:</span>{" "}
              <span className="text-gray-800 font-semibold">
                {new Date(
                  tour.start_date?.$date || tour.start_date,
                ).toLocaleDateString("vi-VN")}
              </span>
            </p>
            <p className="flex items-center gap-1.5 italic">
              ⌛ <span className="text-gray-600">Thời gian:</span>{" "}
              <span className="text-gray-800 font-semibold">
                {tour.duration}
              </span>
            </p>
            <p className="flex items-center gap-1.5 italic">
              ✈ <span className="text-gray-600">Phương tiện:</span>{" "}
              <span className="text-gray-800 font-semibold">
                Vietnam Airlines
              </span>
            </p>
          </div>
        </div>

        {/* 3. PHẦN GIÁ VÀ NÚT BẤM */}
        <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 line-through leading-none mb-1">
              {formatPrice(tour.price?.adult)}
            </span>
            <span className="text-red-600 font-black text-base leading-none">
              {formatPrice(finalPrice)}
            </span>
          </div>
          <Link
            to={`/tours/${tour.slug}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all shadow-sm"
          >
            XEM CHI TIẾT
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TourCardHorizontal;
