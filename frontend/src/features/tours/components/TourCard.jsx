// import React from "react";
// import { Link } from "react-router-dom";

// const TourCard = ({ tour }) => {
//   const isTourEnded = new Date(tour.start_date) < new Date();

//   const formatPrice = (price) => {
//     if (!price) return "0 ₫";
//     return new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(price);
//   };

//   // 🛠️ HÀM ĐÃ SỬA: Tính giá gốc (giá trước khi giảm)
//   // Logic: Nếu có sale %, ta suy ra giá gốc = Giá hiện tại / (1 - %sale/100)
//   const calcOldPrice = (currentPrice, salePercentage) => {
//     if (!salePercentage || salePercentage <= 0) return null;
//     return currentPrice / (1 - salePercentage / 100);
//   };

//   return (
//     <div
//       className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full relative group ${isTourEnded ? "opacity-90" : ""}`}
//     >
//       {/* KHU VỰC HÌNH ẢNH */}
//       <div className="relative overflow-hidden h-60">
//         {/* ✅ FIX: NHÃN GIẢM GIÁ ĐỎ ĐÃ QUAY TRỞ LẠI! */}
//         {/* Chỉ cần sale_percentage > 0 là chắc chắn hiện */}
//         {tour.sale_percentage > 0 && !isTourEnded && (
//           <div className="absolute top-4 left-4 z-30 bg-red-600 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-xl animate-pulse flex flex-col items-center leading-none">
//             <span className="text-[9px] uppercase opacity-80 mb-0.5">
//               Tiết kiệm
//             </span>
//             <span>{tour.sale_percentage}%</span>
//           </div>
//         )}

//         {/* BADGE SỐ CHỖ */}
//         {tour.available_seats !== undefined && !isTourEnded && (
//           <div className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-md text-orange-600 border border-orange-100 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1.5">
//             <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
//             CÒN {tour.available_seats} VÉ
//           </div>
//         )}

//         <img
//           src={
//             tour.images && tour.images.length > 0
//               ? tour.images[0]
//               : tour.image_url || "https://placehold.co/600x400?text=No+Image"
//           }
//           alt={tour.title}
//           className={`w-full h-full object-cover transition-transform duration-700 ${isTourEnded ? "grayscale-[40%]" : "group-hover:scale-110"}`}
//         />

//         {/* LỚP PHỦ KHI KẾT THÚC */}
//         {isTourEnded && (
//           <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-[2px]">
//             <div className="bg-white/10 border-2 border-white/30 text-white px-6 py-2 rounded-full font-black tracking-widest uppercase transform -rotate-12 text-lg shadow-2xl">
//               Đã Kết Thúc
//             </div>
//           </div>
//         )}

//         {/* THỜI LƯỢNG TOUR */}
//         <div className="absolute bottom-0 left-0 bg-blue-600/90 backdrop-blur-sm text-white px-5 py-2 rounded-tr-2xl text-xs font-black shadow-lg z-10 uppercase tracking-tighter">
//           ⏱️ {tour.duration}
//         </div>
//       </div>

//       {/* KHU VỰC NỘI DUNG */}
//       <div className="p-6 flex-grow flex flex-col">
//         <h3
//           className={`text-lg font-black mb-3 line-clamp-2 leading-tight transition-colors ${isTourEnded ? "text-gray-400" : "text-gray-800 group-hover:text-blue-600"}`}
//         >
//           {tour.title}
//         </h3>

//         <p className="text-[13px] text-gray-500 mb-6 line-clamp-2 italic font-medium">
//           {tour.description}
//         </p>

//         <div className="mt-auto space-y-4">
//           {/* Thông tin ngày đi */}
//           <div className="flex justify-between items-center text-[11px] bg-gray-50 p-3 rounded-xl border border-gray-100 font-bold uppercase tracking-tight">
//             <span className="text-gray-400">📅 Khởi hành</span>
//             <span
//               className={
//                 isTourEnded ? "text-gray-300 line-through" : "text-blue-700"
//               }
//             >
//               {new Date(tour.start_date).toLocaleDateString("vi-VN")}
//             </span>
//           </div>

//           <div className="flex justify-between items-end pt-2 gap-2">
//             <div className="flex flex-col">
//               {/* ✅ LOGIC GIÁ: Sử dụng hàm calcOldPrice mới */}
//               {tour.sale_percentage > 0 ? (
//                 <>
//                   <span className="text-[11px] text-gray-400 line-through mb-0.5 font-bold decoration-red-400/50">
//                     {formatPrice(
//                       calcOldPrice(tour.price?.adult, tour.sale_percentage),
//                     )}
//                   </span>
//                   <span
//                     className={`text-xl font-black tracking-tighter ${isTourEnded ? "text-gray-300" : "text-red-600"}`}
//                   >
//                     {formatPrice(tour.price?.adult)}
//                   </span>
//                 </>
//               ) : (
//                 /* Không giảm giá -> Chỉ hiện 1 giá xanh */
//                 <span
//                   className={`text-xl font-black tracking-tighter ${isTourEnded ? "text-gray-300" : "text-blue-700"}`}
//                 >
//                   {formatPrice(tour.price?.adult)}
//                 </span>
//               )}
//             </div>

//             <Link
//               to={`/tours/${tour.slug}`}
//               className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm transition-all transform flex items-center justify-center gap-2 ${
//                 isTourEnded
//                   ? "border-2 border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
//                   : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-blue-200 shadow-lg"
//               }`}
//             >
//               {isTourEnded ? "Hết Hạn" : "Chi Tiết"}
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TourCard;


import React from "react";
import { Link } from "react-router-dom";

const TourCard = ({ tour }) => {
  const isTourEnded = new Date(tour.start_date) < new Date();
  
  const formatPrice = (p) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);
    
  const calcSalePrice = (p, s) => s ? p * (1 - s / 100) : p;

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full relative group ${isTourEnded ? "opacity-95" : ""}`}>
      
      {/* KHU VỰC HÌNH ẢNH & BADGES */}
      <div className="relative overflow-hidden h-56">
        {/* Badge Giảm Giá (Góc Trái) */}
        {tour.sale_percentage > 0 && !isTourEnded && (
          <div className="absolute top-3 left-3 z-30 bg-red-600 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-lg animate-pulse">
            GIẢM {tour.sale_percentage}%
          </div>
        )}
        
        {/* Badge Số Chỗ (Góc Phải) */}
        {tour.available_seats !== undefined && !isTourEnded && (
          <div className="absolute top-3 right-3 z-30 bg-white/95 backdrop-blur-sm text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
            CÒN {tour.available_seats} CHỖ
          </div>
        )}

        {/* Lớp phủ Đã kết thúc */}
        {isTourEnded && (
          <div className="absolute inset-0 z-40 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-black text-xl tracking-widest border-2 border-white/50 px-6 py-2 rounded-xl rotate-[-10deg]">
              ĐÃ KẾT THÚC
            </span>
          </div>
        )}

        <img 
          src={tour.images?.[0] || "https://placehold.co/400x300?text=No+Image"} 
          alt={tour.title} 
          className={`w-full h-full object-cover transition-transform duration-700 ${!isTourEnded ? "group-hover:scale-110" : "grayscale"}`}
        />
      </div>

      {/* KHU VỰC NỘI DUNG */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-800 text-lg mb-3 line-clamp-2 leading-tight min-h-[3.5rem]">
          {tour.title}
        </h3>
        
        <div className="space-y-2 mb-4 flex-grow">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span className="opacity-70">⏱️</span> {tour.duration}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span className="opacity-70">📅</span> Khởi hành: 
            <span className="font-semibold text-gray-700">
              {new Date(tour.start_date).toLocaleDateString("vi-VN")}
            </span>
          </p>
        </div>

        {/* KHU VỰC GIÁ & NÚT ĐẶT */}
        <div className="pt-4 border-t border-gray-100 flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Giá từ</p>
            {tour.sale_percentage > 0 ? (
              <div>
                <p className="text-xs text-gray-400 line-through mb-0.5">
                  {formatPrice(tour.price?.adult)}
                </p>
                <p className="text-lg font-black text-orange-600">
                  {formatPrice(calcSalePrice(tour.price?.adult, tour.sale_percentage))}
                </p>
              </div>
            ) : (
              <p className="text-lg font-black text-blue-700">
                {formatPrice(tour.price?.adult)}
              </p>
            )}
          </div>
          
          <Link 
            to={`/tours/${tour.slug}`}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              isTourEnded 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-100 hover:shadow-md"
            }`}
            onClick={(e) => isTourEnded && e.preventDefault()}
          >
            {isTourEnded ? "XEM CHI TIẾT" : "ĐẶT NGAY"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
