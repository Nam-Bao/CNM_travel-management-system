import React from 'react';

const SeatMap = ({ tour, selectedSlots, onSelectSlot }) => {
  // 1. Tour nước ngoài -> Không hiện sơ đồ
  if (tour.category === 'international' || tour.transportType === 'flight') {
    return (
      <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
        ✈️ Tour quốc tế: Vị trí chỗ ngồi sẽ được sắp xếp tại sân bay.
      </div>
    );
  }

  const isBedBus = tour.transportType === 'bus_bed';

  return (
    <div className="mt-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        {isBedBus ? "🛏️ Chọn vị trí giường nằm" : "💺 Chọn vị trí ghế ngồi"}
      </h3>

      <div className={`grid ${isBedBus ? 'grid-cols-3' : 'grid-cols-4'} gap-3`}>
        {tour.beds && tour.beds.map((slot) => {
          const isSelected = selectedSlots.includes(slot.code);
          const isDouble = slot.type === 'double';
          
          return (
            <button
              key={slot.code}
              disabled={slot.isBooked}
              onClick={() => onSelectSlot(slot.code)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${slot.isBooked ? 'bg-gray-100 border-gray-100 cursor-not-allowed' : 
                  isSelected ? 'border-orange-500 bg-orange-50 shadow-inner' : 'border-gray-200 hover:border-orange-300'}
                ${isDouble ? 'col-span-1 border-purple-200' : ''}
              `}
            >
              <span className={`text-xs font-bold ${isSelected ? 'text-orange-600' : 'text-gray-500'}`}>
                {slot.code}
              </span>
              <div className="text-[10px] mt-1 text-gray-400">
                {isDouble ? "👫 Đôi" : isBedBus ? "👤 Đơn" : "💺 Ghế"}
              </div>
              {isDouble && !slot.isBooked && (
                <span className="absolute -top-2 -right-1 bg-purple-500 text-white text-[8px] px-1 rounded">
                  + phí
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chú thích */}
      <div className="mt-6 flex gap-4 text-xs text-gray-500 border-t pt-4">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-white border border-gray-300 rounded"></span> Trống</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded"></span> Đang chọn</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 rounded"></span> Đã đặt</div>
        {isBedBus && <div className="flex items-center gap-1"><span className="w-3 h-3 border border-purple-300 rounded"></span> Giường đôi</div>}
      </div>
    </div>
  );
};

export default SeatMap;