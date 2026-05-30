import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HotelListing = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("Tất cả");
  const navigate = useNavigate();

  const cities = [
    "Tất cả",
    "PHÚ QUỐC",
    "HUẾ",
    "HÀ GIANG",
    "SAPA",
    "ĐÀ LẠT",
    "VỊNH HẠ LONG",
    "NHA TRANG",
    "NINH BÌNH",
    "ĐÀ NẴNG",
    "CẦN THƠ",
    "PHAN THIẾT",
    "CÔN ĐẢO",
  ];

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/hotels`);
        const data = Array.isArray(res.data) ? res.data : [];
        setHotels(data);
        setFilteredHotels(data);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const handleFilter = (city) => {
    setSelectedCity(city);
    setFilteredHotels(
      city === "Tất cả" ? hotels : hotels.filter((h) => h.city === city),
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-blue-700 py-16 text-center text-white">
        <h1 className="text-4xl font-black mb-2">HỆ THỐNG KHÁCH SẠN</h1>
        <p className="text-orange-400 font-bold uppercase tracking-widest">
          Luxury Stays in Vietnam
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10">
        <div className="bg-white p-4 rounded-3xl shadow-xl flex gap-3 overflow-x-auto no-scrollbar mb-10">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => handleFilter(city)}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap text-xs transition-all ${
                selectedCity === city
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 font-bold text-gray-400 animate-pulse">
            ĐANG TẢI...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id || hotel._id}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all group cursor-pointer border border-gray-100 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative bg-gray-200">
                  <img
                    // LẤY ẢNH ĐẦU TIÊN TRONG MẢNG IMAGES
                    src={
                      hotel.images && hotel.images.length > 0
                        ? hotel.images[0]
                        : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={hotel.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800";
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-blue-700">
                    📍 {hotel.city}
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex gap-1 mb-2">
                    {[...Array(hotel.star || 5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xs">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                    {hotel.name}
                  </h3>
                  <div className="mt-6 flex justify-between items-end border-t pt-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        Giá từ
                      </p>
                      <p className="text-2xl font-black text-orange-500">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(hotel.price_per_night)}
                      </p>
                    </div>
                    <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md">
                      CHI TIẾT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelListing;
