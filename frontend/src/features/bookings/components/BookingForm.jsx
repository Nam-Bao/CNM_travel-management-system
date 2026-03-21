import { useEffect, useState } from "react";
import bookingApi from "../api/bookingApi";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingApi.getMyBookings();
        setBookings(res.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Lịch sử đặt tour</h2>

      <div className="space-y-4">
        {bookings.length === 0 && <p>Chưa có booking nào</p>}

        {bookings.map((b) => (
          <div key={b._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{b.tour?.title}</h3>
            <p>👥 Số người: {b.number_of_people}</p>
            <p>
              📅 Ngày đi: {new Date(b.travel_date).toLocaleDateString("vi-VN")}
            </p>
            <p>
              💰 Trạng thái:{" "}
              <span className="text-blue-600 font-semibold">{b.status}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingHistory;
