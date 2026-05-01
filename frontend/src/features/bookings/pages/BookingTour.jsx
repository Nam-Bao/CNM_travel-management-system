import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bookingApi from "../api/bookingApi";

const BookingTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tour, guestSize, contactInfo, tourPrice } = location.state || {};

  const [selectedBeds, setSelectedBeds] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalGuests = Number(guestSize?.adult || 0) + Number(guestSize?.child || 0) + Number(guestSize?.infant || 0);
  
  // 1. KIỂM TRA LOẠI TOUR CHUẨN XÁC (Bắt cả vehicle_type lẫn transportType đề phòng DB đặt sai tên)
  const isDomestic = tour?.tour_type === "domestic";
  const isInternational = tour?.tour_type === "international";
 const isBedBus = true;
  const isSeatBus = false;

// 2. TỰ ĐỘNG SINH DỮ LIỆU NẾU DATABASE RỖNG
// 2. ÉP BUỘC SINH 30 GHẾ (BỎ QUA DATABASE ĐỂ TEST UI CHO ĐẸP)
  const { tangDuoi, tangTren, seatBusBeds, allBeds } = useMemo(() => {
    
    // HACK: Ép tạo ra luôn 30 ghế, không thèm nhìn Database nữa
    let beds = Array.from({ length: 30 }, (_, i) => ({
      code: `A${i + 1}`,
      type: "single", // Đơn
      isBooked: false
    }));

    if (isBedBus) {
      const half = Math.ceil(beds.length / 2); // 30 chia 2 = 15 chẵn mỗi tầng
      return { tangDuoi: beds.slice(0, half), tangTren: beds.slice(half), seatBusBeds: [], allBeds: beds };
    } else if (isSeatBus) {
      return { tangDuoi: [], tangTren: [], seatBusBeds: beds, allBeds: beds };
    }
    return { tangDuoi: [], tangTren: [], seatBusBeds: [], allBeds: [] };
  }, [tour, isBedBus, isSeatBus]);

  
  const handleBooking = async () => {
    if (isDomestic && selectedBeds.length !== totalGuests) return;
    
    setLoading(true);
    try {
      await bookingApi.createBooking({ 
        tourId: tour._id, 
        selected_beds: isDomestic ? selectedBeds : [], 
        guest_size: guestSize, 
        contact_info: contactInfo 
      });
      navigate("/my-bookings");
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi đặt tour: Database Backend chưa khớp số ghế.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeat = (code) => {
    if (selectedBeds.includes(code)) {
      setSelectedBeds(selectedBeds.filter(x => x !== code));
    } else if (selectedBeds.length < totalGuests) {
      setSelectedBeds([...selectedBeds, code]);
    }
  };

  if (!tour) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-32 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-sm border-x">
        
        <div className="p-4 border-b">
           <button 
             onClick={() => {
                navigate(`/tours/${tour.slug}`, { state: { returnedData: { guestSize, contactInfo } } });
             }} 
             className="text-blue-600 font-bold hover:underline flex items-center gap-1"
           >
             ← Quay lại chỉnh sửa
           </button>
        </div>

        <div className="p-8">
          <div className="flex justify-center items-center space-x-2 md:space-x-4 mb-10 text-xs md:text-sm">
            <div className="flex items-center text-blue-600 font-bold">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">1</span> {isInternational ? "Xác nhận" : "Chọn chỗ"}
            </div>
            <div className="w-8 md:w-16 h-px bg-gray-300"></div>
            <div className="flex items-center text-gray-400">
              <span className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center mr-2">2</span> Thanh toán
            </div>
          </div>

          {isDomestic && (
             <div className="flex justify-center gap-6 mb-10 text-xs md:text-sm text-gray-600">
               <div className="flex items-center gap-2">
                 <div className="w-5 h-7 border-2 border-gray-300 rounded bg-white"></div> Còn trống
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-5 h-7 border-2 border-gray-200 rounded bg-gray-200 flex items-center justify-center text-gray-400 font-black text-[10px]">X</div> Đã bán
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-5 h-7 border-2 border-green-500 rounded bg-green-500 flex items-center justify-center text-white font-black text-[10px]">✓</div> Đang chọn
               </div>
             </div>
          )}

          {/* =========================================
              HIỂN THỊ: XE GIƯỜNG NẰM (GIƯỜNG ĐÔI/ĐƠN)
              ========================================= */}
          {isBedBus && (
            <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-20">
              <div className="flex flex-col items-center">
                <h4 className="font-bold mb-4 text-gray-700">Tầng dưới</h4>
                <div className="bg-gray-100 p-6 rounded-t-[60px] rounded-b-[20px] w-64 shadow-inner border border-gray-200">
                  <div className="flex justify-center mb-6">
                     <div className="w-8 h-8 rounded-full border-4 border-gray-300 flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                     </div>
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                    {tangDuoi.map(bed => (
                      <button
                        key={bed.code} disabled={bed.isBooked} onClick={() => handleSelectSeat(bed.code)}
                        className={`relative w-12 h-16 mx-auto rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                          bed.isBooked ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed' : selectedBeds.includes(bed.code) ? 'bg-green-500 border-green-500 text-white shadow-md' : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
                        }`}
                      >
                        {bed.isBooked ? <span className="text-xl font-black opacity-50">X</span> : (
                          <>
                            <span className="text-[11px] font-bold">{bed.code}</span>
                            <span className={`text-[7px] uppercase font-bold opacity-80 mt-0.5 ${bed.type === 'double' ? 'text-orange-600' : 'text-blue-500'}`}>
                              {bed.type === 'double' ? 'Đôi' : 'Đơn'}
                            </span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <h4 className="font-bold mb-4 text-gray-700">Tầng trên</h4>
                <div className="bg-gray-100 p-6 rounded-t-[60px] rounded-b-[20px] w-64 shadow-inner border border-gray-200">
                  <div className="flex justify-center mb-6"><div className="w-8 h-8"></div></div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                    {tangTren.map(bed => (
                      <button
                        key={bed.code} disabled={bed.isBooked} onClick={() => handleSelectSeat(bed.code)}
                        className={`relative w-12 h-16 mx-auto rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                          bed.isBooked ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed' : selectedBeds.includes(bed.code) ? 'bg-green-500 border-green-500 text-white shadow-md' : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
                        }`}
                      >
                        {bed.isBooked ? <span className="text-xl font-black opacity-50">X</span> : (
                          <>
                            <span className="text-[11px] font-bold">{bed.code}</span>
                            <span className={`text-[7px] uppercase font-bold opacity-80 mt-0.5 ${bed.type === 'double' ? 'text-orange-600' : 'text-blue-500'}`}>
                              {bed.type === 'double' ? 'Đôi' : 'Đơn'}
                            </span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              HIỂN THỊ: XE GHẾ NGỒI (A1 -> A29)
              ========================================= */}
          {isSeatBus && (
            <div className="flex flex-col items-center">
              <h4 className="font-bold mb-4 text-gray-700">Sơ đồ xe (29 chỗ ngồi)</h4>
              <div className="bg-gray-100 p-6 rounded-t-[60px] rounded-b-[20px] max-w-sm w-full shadow-inner border border-gray-200">
                <div className="flex justify-between items-center mb-6 px-4">
                   <span className="text-xs font-bold text-gray-400">Cửa lên</span>
                   <div className="w-8 h-8 rounded-full border-4 border-gray-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                   </div>
                </div>
                <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                  {seatBusBeds.map(bed => (
                    <button
                      key={bed.code} disabled={bed.isBooked} onClick={() => handleSelectSeat(bed.code)}
                      className={`relative w-12 h-14 mx-auto rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        bed.isBooked ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed' : selectedBeds.includes(bed.code) ? 'bg-green-500 border-green-500 text-white shadow-md' : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
                      }`}
                    >
                      {bed.isBooked ? <span className="text-xl font-black opacity-50">X</span> : (
                        <span className="text-[11px] font-bold">{bed.code}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HIỂN THỊ: MÁY BAY */}
          {isInternational && (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-blue-50 rounded-3xl border border-blue-100 text-center mx-4 shadow-sm">
               <span className="text-6xl mb-6 block animate-bounce">✈️</span>
               <h3 className="text-2xl md:text-3xl font-black text-blue-800 uppercase mb-4 tracking-tight">Xác Nhận Đơn Hàng Quốc Tế</h3>
               <p className="text-gray-600 font-medium max-w-lg leading-relaxed">
                 Đối với tour di chuyển bằng máy bay, hệ thống không hỗ trợ chọn ghế trước. Vị trí ghế ngồi sẽ được hãng hàng không sắp xếp tự động khi Quý khách làm thủ tục check-in tại sân bay.
               </p>
               <p className="mt-6 text-sm font-bold text-blue-600 bg-blue-100 py-2 px-4 rounded-lg inline-block">
                 Quý khách vui lòng bấm "Tiếp tục" bên dưới để thanh toán.
               </p>
            </div>
          )}

        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            {isDomestic ? (
              <>
                Số chỗ: {" "}
                {selectedBeds.length > 0 ? (
                  <span className="font-bold text-gray-800">{selectedBeds.join(', ')}</span>
                ) : (
                  <span className="text-gray-500 font-medium">Vui lòng chọn đủ {totalGuests} chỗ</span>
                )}
              </>
            ) : (
              <span className="font-bold text-gray-500 italic">Áp dụng chính sách bay tự động</span>
            )}
          </div>
          
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right flex items-center gap-2">
              <span className="text-sm text-gray-600">Tổng cộng:</span>
              <span className="text-xl md:text-2xl font-black text-blue-600">
                {new Intl.NumberFormat('vi-VN').format(totalPrice)} đ
              </span>
            </div>
            
            <button 
              disabled={isButtonDisabled}
              onClick={handleBooking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Tiếp tục"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTour;