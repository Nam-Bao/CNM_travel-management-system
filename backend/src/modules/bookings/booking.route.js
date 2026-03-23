const express = require("express");
const router = express.Router();
const bookingController = require("./booking.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// Tạo booking mới
router.post("/", verifyToken, bookingController.createBooking);

// Lấy lịch sử booking
router.get("/my-bookings", verifyToken, bookingController.getMyBookings);

router.get("/", verifyToken, bookingController.getAllBookings);

router.put("/:id/cancel", bookingController.cancelBooking);

module.exports = router;
