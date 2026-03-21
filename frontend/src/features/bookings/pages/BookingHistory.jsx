import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bookingApi from "../api/bookingApi";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await bookingApi.getMyBookings();
        // Kiểm tra cấu trúc data trả về từ backend (res.data hoặc res.data.data)
        setBookings(res.data?.data || res.data || []);
      } catch (err) {
        setError("Không thể tải lịch sử đặt tour. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center font-bold text-blue-600">
        đang tải lịch sử đặt tour...
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header đơn giản */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            ✈️ Lịch sử đặt tour của bạn
          </h1>
          <Link
            to="/"
            className="text-blue-600 font-bold hover:underline text-sm"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6 font-bold">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border text-center">
            <p className="text-gray-400 mb-6 italic text-lg">
              Bạn chưa có chuyến đi nào.
            </p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg"
            >
              Khám phá tour ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl shadow-sm border overflow-hidden hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Ảnh Tour */}
                  <img
                    src={
                      item.tour?.images?.[0] ||
                      "https://placehold.co/300x200?text=Tour+Image"
                    }
                    className="w-full md:w-64 h-48 object-cover"
                    alt="Tour"
                  />

                  {/* Thông tin vé */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {item.tour?.title}
                      </h2>
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                        📅 Khởi hành:{" "}
                        <span className="text-blue-600 font-semibold">
                          {new Date(item.tour?.start_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-600 uppercase bg-gray-50 p-3 rounded-xl border border-dashed">
                        <span>👤 Lớn: {item.guest_size?.adult}</span>
                        <span>👶 Trẻ em: {item.guest_size?.child || 0}</span>
                        <span>🍼 Em bé: {item.guest_size?.infant || 0}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-end border-t pt-4">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1">
                          Tổng tiền thanh toán
                        </p>
                        <p className="text-xl font-black text-orange-600">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                        Thành công
                      </span>
                    </div>
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

export default BookingHistory;
