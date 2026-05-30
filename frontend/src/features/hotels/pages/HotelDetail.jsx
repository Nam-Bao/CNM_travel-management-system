import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/hotels/${id}`);
        setHotel(res.data);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-blue-600 animate-spin">
        ⌛ Đang tải...
      </div>
    );
  if (!hotel)
    return (
      <div className="p-20 text-center text-red-500">
        Không tìm thấy khách sạn!
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 1. Phần Ảnh - Tách biệt hoàn toàn */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 h-[500px] gap-3">
          <div className="md:col-span-2 h-full">
            <img
              src={hotel.images?.[0]}
              className="w-full h-full object-cover rounded-3xl shadow-lg"
              alt="Main"
            />
          </div>
          <div className="md:col-span-2 grid grid-cols-2 grid-rows-2 gap-3 h-full">
            <img
              src={hotel.images?.[1]}
              className="w-full h-full object-cover rounded-3xl shadow-sm"
              alt="S1"
            />
            <img
              src={hotel.images?.[2]}
              className="w-full h-full object-cover rounded-3xl shadow-sm"
              alt="S2"
            />
            <img
              src={hotel.images?.[0]}
              className="w-full h-full object-cover rounded-3xl shadow-sm"
              alt="S3"
            />
            <div className="relative group cursor-pointer">
              <img
                src={hotel.images?.[1]}
                className="w-full h-full object-cover rounded-3xl blur-[2px]"
                alt="S4"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl text-white font-bold">
                + Xem tất cả ảnh
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Phần Thông tin khách sạn - Nằm riêng phía dưới ảnh */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-10">
          <div className="flex gap-1 mb-3">
            {[...Array(hotel.star || 5)].map((_, i) => (
              <span key={i} className="text-yellow-400">
                ⭐
              </span>
            ))}
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 uppercase tracking-tighter">
            {hotel.name}
          </h1>
          <p className="text-blue-600 font-bold text-lg mb-6">
            📍 {hotel.city} - {hotel.address}
          </p>
          <hr className="my-6 border-gray-100" />
          <p className="text-gray-600 leading-relaxed text-lg italic">
            "{hotel.description}"
          </p>
        </div>

        {/* 3. Danh sách phòng - Phải hiện ở đây */}
        <h2 className="text-3xl font-black mb-8 text-gray-800 flex items-center gap-3">
          🏨 CHỌN LOẠI PHÒNG
        </h2>

        <div className="space-y-8 pb-20">
          {hotel.room_types?.map((room, index) => (
            <div
              key={index}
              className="bg-white rounded-[40px] p-8 shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col lg:flex-row gap-8"
            >
              <div className="w-full lg:w-80 h-56 overflow-hidden rounded-[30px] shrink-0">
                <img
                  src={room.image}
                  className="w-full h-full object-cover"
                  alt={room.name}
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {room.name}
                </h3>
                <div className="flex gap-6 text-sm text-gray-400 font-bold mb-5 uppercase tracking-widest">
                  <span>👥 {room.capacity} Khách</span>
                  <span>
                    🛌{" "}
                    {room.capacity >= 4 ? "2 Giường đôi lớn" : "Giường đôi lớn"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.amenities?.map((a, i) => (
                    <span
                      key={i}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-black"
                    >
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:border-l lg:pl-10 flex flex-col justify-center min-w-[240px]">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">
                  Giá mỗi đêm từ
                </p>
                <p className="text-3xl font-black text-orange-500 mb-6">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(room.price_per_night)}
                </p>
                <button
                  onClick={() =>
                    navigate(`/hotel-booking/${hotel.id}?room=${room.name}`)
                  }
                  className="bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase"
                >
                  Chọn phòng
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
