require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.config");
const Hotel = require("./modules/hotels/hotel.model");

// 1. Kết nối Database
connectDB();

const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Import & Đăng ký Routes
const authRoutes = require("./modules/auth/auth.route");
const tourRoutes = require("./modules/tours/tour.route");
const userRoutes = require("./modules/users/user.route");
const bookingRoutes = require("./modules/bookings/booking.route");
const reviewRoutes = require("./modules/reviews/review.route");
const paymentRoutes = require("./modules/payment/vnpay.route");

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);

// 4. API Khách sạn
// Lấy toàn bộ danh sách
app.get("/api/hotels", async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 }); // Hiện cái mới nhất lên đầu
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: "Lỗi kết nối Database" });
  }
});

// Lấy chi tiết 1 khách sạn (Đã tối ưu để không bị trắng trang Frontend)
app.get("/api/hotels/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm theo trường 'id' (h-0-1, h1...) hoặc '_id' (ObjectId)
    const hotel = await Hotel.findOne({
      $or: [
        { id: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, // Nếu là ObjectId hợp lệ thì mới tìm
      ],
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khách sạn trong Database" });
    }

    res.json(hotel);
  } catch (err) {
    console.error("Lỗi API Hotel Detail:", err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết khách sạn" });
  }
});

// 5. Khởi chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 SERVER ĐANG CHẠY: http://localhost:${PORT}`);
  console.log(`📂 API HOTELS: http://localhost:${PORT}/api/hotels`);
  console.log(`==============================================\n`);
});
