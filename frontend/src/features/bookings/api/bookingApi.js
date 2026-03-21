import axiosClient from "../../../services/axiosClient";

const bookingApi = {
  // Lấy lịch sử booking của user
  getMyBookings: () => {
    return axiosClient.get("/bookings/my-bookings");
  },

  // Tạo booking
  createBooking: (data) => {
    return axiosClient.post("/bookings", data);
  },
};

export default bookingApi;
