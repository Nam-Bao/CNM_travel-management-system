import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BookingTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tour, guestSize, contactInfo, tourPrice } = location.state || {};

  const [selectedBeds, setSelectedBeds] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalGuests = Number(guestSize?.adult || 0) + Number(guestSize?.child || 0) + Number(guestSize?.infant || 0);
  
  const isDomestic = tour?.tour_type === "domestic";
  const isInternational = tour?.tour_type === "international";

  // 1. ĐỌC LOẠI XE TỪ DATABASE CHUẨN
  const isBedBus = tour?.vehicle_type === "bed";
  const isSeatBus = tour?.vehicle_type === "seat";

  // 2. TÁCH DỮ LIỆU GHẾ CHO TỪNG LOẠI XE
  const { tangDuoi, tangTren, seatBusBeds } = useMemo(() => {
    let beds = tour?.beds || [];

    if (isBedBus) {
      // Xe giường nằm 24 chỗ (12 dưới, 12 trên)
      const half = Math.ceil(beds.length / 2);
      return {
        tangDuoi: beds.slice(0, half),
        tangTren: beds.slice(half),
        seatBusBeds: []
      };
    } else if (isSeatBus) {
      // Xe ghế ngồi 29 chỗ (1 tầng)
      return { tangDuoi: [], tangTren: [], seatBusBeds: beds };
    }
    
    return { tangDuoi: [], tangTren: [], seatBusBeds: [] };
  }, [tour, isBedBus, isSeatBus]);

  
  const handleBooking = () => {
    if (isDomestic && selectedBeds.length !== totalGuests) return;
    
    navigate("/booking-payment", {
      state: {
        tour,
        guestSize,
        contactInfo,
        tourPrice,
        selectedBeds 
      }
    });
  };

  const handleSelectSeat = (code) => {
    if (selectedBeds.includes(code)) {
      setSelectedBeds(selectedBeds.filter(x => x !== code));
    } else if (selectedBeds.length < totalGuests) {
      setSelectedBeds([...selectedBeds, code]);
    }
  };

  if (!tour) return null;
  const isButtonDisabled = isDomestic ? selectedBeds.length !== totalGuests : false;
  
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
                 <div className="w-5 h-7 border-2 border-blue-600 rounded bg-blue-600 flex items-center justify-center text-white font-black text-[10px]">✓</div> Đang chọn
               </div>
             </div>
          )}

          {/* =========================================
              HIỂN THỊ 1: XE GIƯỜNG NẰM (2 TẦNG - 24 CHỖ)
              ========================================= */}
          {isBedBus && (
            <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-20">
              
              {/* TẦNG DƯỚI (A1 - A12) */}
              <div className="flex flex-col items-center">
                <h4 className="font-bold mb-4 text-gray-700">Tầng dưới</h4>
                <div className="bg-gray-50 p-6 rounded-t-[60px] rounded-b-[20px] w-[280px] shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-8 px-2">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-white leading-tight">Tài xế</span>
                    </div>
                    <div className="w-6 h-6 rounded-full border-4 border-gray-300"></div>
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-white text-center leading-tight">Cửa<br/>lên</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                    {tangDuoi.map(bed => (
                      <button key={bed.code} disabled={bed.isBooked} onClick={() => handleSelectSeat(bed.code)}
                        className={`relative w-12 h-16 mx-auto rounded-lg border-2 flex flex-col items-center justify-center transition-all ${bed.isBooked ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed' : selectedBeds.includes(bed.code) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-300 text-blue-600 hover:border-blue-400'}`}>
                        {bed.isBooked ? <span className="text-xl font-black opacity-50">X</span> : (
                          <><span className="text-[12px] font-bold">{bed.code}</span><span className="text-[8px] font-bold opacity-70 mt-1">ĐƠN</span></>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TẦNG TRÊN (B1 - B12) */}
              <div className="flex flex-col items-center">
                <h4 className="font-bold mb-4 text-gray-700">Tầng trên</h4>
                <div className="bg-gray-50 p-6 rounded-t-[60px] rounded-b-[20px] w-[280px] shadow-sm border border-gray-200">
                  <div className="h-[72px] mb-8"></div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                    {tangTren.map(bed => (
                      <button key={bed.code} disabled={bed.isBooked} onClick={() => handleSelectSeat(bed.code)}
                        className={`relative w-12 h-16 mx-auto rounded-lg border-2 flex flex-col items-center justify-center transition-all ${bed.isBooked ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed' : selectedBeds.includes(bed.code) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-300 text-blue-600 hover:border-blue-400'}`}>
                        {bed.isBooked ? <span className="text-xl font-black opacity-50">X</span> : (
                          <><span className="text-[12px] font-bold">{bed.code}</span><span className="text-[8px] font-bold opacity-70 mt-1">ĐƠN</span></>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =========================================
              HIỂN THỊ 2: XE GHẾ NGỒI (1 TẦNG - 29 CHỖ)
              ========================================= */}
          {isSeatBus && (
            <div className="flex flex-col items-center">
              <h4 className="font-bold mb-4 text-gray-700">Sơ đồ xe (29 chỗ)</h4>
              <div className="bg-gray-50 p-6 rounded-t-[60px] rounded-b-[20px] w-[340px] shadow-sm border border-gray-200">
                
                {/* Khu vực Đầu xe */}
                <div className="flex justify-between items-center px-2 mb-8">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-white leading-tight">Tài xế</span>
                  </div>
                  <div className="w-6 h-6 rounded-full border-4 border-gray-300"></div>
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-white text-center leading-tight">Cửa<br/>lên</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                  {seatBusBeds.map(bed => (
                    <button key={bed.code} disabled={bed.isBooked} onClick={() => handleSelectSeat(bed.code)}
                      className={`relative w-12 h-14 mx-auto rounded-lg border-2 flex flex-col items-center justify-center transition-all ${bed.isBooked ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed' : selectedBeds.includes(bed.code) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-300 text-blue-600 hover:border-blue-400'}`}>
                      {bed.isBooked ? <span className="text-xl font-black opacity-50">X</span> : (
                        <span className="text-[12px] font-bold">{bed.code}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HIỂN THỊ 3: MÁY BAY */}
          {isInternational && (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-blue-50 rounded-3xl border border-blue-100 text-center mx-4 shadow-sm">
               <span className="text-6xl mb-6 block animate-bounce">✈️</span>
               <h3 className="text-2xl md:text-3xl font-black text-blue-800 uppercase mb-4 tracking-tight">Xác Nhận Đơn Hàng Quốc Tế</h3>
               <p className="text-gray-600 font-medium max-w-lg leading-relaxed">
                 Đối với tour di chuyển bằng máy bay, hệ thống không hỗ trợ chọn ghế trước. Vị trí ghế ngồi sẽ được hãng hàng không sắp xếp tự động khi làm thủ tục.
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
                {new Intl.NumberFormat('vi-VN').format(tourPrice)} đ
              </span>
            </div>
            
            <button disabled={isButtonDisabled} onClick={handleBooking} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed">
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTour;