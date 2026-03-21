const express = require("express");
const router = express.Router();

const bookingController = require("./booking.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// tạo booking
router.post("/", verifyToken, bookingController.createBooking);

// lấy lịch sử booking của user
router.get("/my-bookings", verifyToken, bookingController.getMyBookings);

module.exports = router;
