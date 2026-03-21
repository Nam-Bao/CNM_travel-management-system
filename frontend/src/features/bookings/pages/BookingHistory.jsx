import { useEffect, useState } from "react";
import bookingApi from "../api/bookingApi";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingApi.getMyBookings();

        // ✅ QUAN TRỌNG: phải lấy res.data
        setBookings(res.data || []);
      } catch (error) {
        console.error("Lỗi lấy booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">Đang tải lịch sử...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-2xl font-bold mb-6">Lịch sử đặt tour</h2>

      {bookings.length === 0 ? (
        <p className="text-gray-500">Bạn chưa đặt tour nào</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white p-5 rounded-xl shadow border">
              <h3 className="text-lg font-bold text-blue-600">
                {b.tour?.title}
              </h3>

              <p className="text-gray-600 mt-2">
                👥 Số người: {b.number_of_people}
              </p>

              <p className="text-gray-600">
                📅 Ngày đi:{" "}
                {new Date(b.booking_date).toLocaleDateString("vi-VN")}
              </p>

              <p className="mt-2">
                💰 Trạng thái:{" "}
                <span className="text-green-600 font-semibold">
                  {b.status || "pending"}
                </span>
              </p>

              <p className="text-red-500 font-bold mt-2">
                Tổng tiền: {b.total_price?.toLocaleString()} VNĐ
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
