require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.config");

// 1. Kết nối Database
connectDB();

// 2. Import Routes
const authRoutes = require("./modules/auth/auth.route");
const tourRoutes = require("./modules/tours/tour.route");
const userRoutes = require("./modules/users/user.route");
const bookingRoutes = require("./modules/bookings/booking.route");
const reviewRoutes = require("./modules/reviews/review.route");

const app = express();

// 3. --- MIDDLEWARE (Bắt buộc trước Routes) ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. --- ĐĂNG KÝ ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Test API gốc
app.get("/", (req, res) => {
  res.json({ status: "success", message: "🚀 API du lịch đã sẵn sàng!" });
});

// 5. --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server chạy tại: http://localhost:${PORT}\n`);
});
