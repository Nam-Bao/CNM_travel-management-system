require("dotenv").config();
const express = require("express");
const cors = require("cors");

// DB
const connectDB = require("./config/db.config");
connectDB();

// Routes
const authRoutes = require("./modules/auth/auth.route");
const tourRoutes = require("./modules/tours/tour.route");
const userRoutes = require("./modules/users/user.route");
const bookingRoutes = require("./modules/bookings/booking.route");
const reviewRoutes = require("./modules/reviews/review.route");

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Test API
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "🚀 Chào mừng đến với API Hệ thống Quản lý Du lịch!",
  });
});

// --- 3. START SERVER ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n=========================================`);
  console.log(`🚀 Server Backend đang chạy tại cổng ${PORT}`);
  console.log(`🔗 Link truy cập: http://localhost:${PORT}`);
  console.log(`=========================================\n`);
});
