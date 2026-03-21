const Review = require("./review.model");
const Booking = require("../bookings/booking.model");

// ===============================
// THÊM REVIEW
// ===============================
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tourId, rating, comment } = req.body;

    // 1. Kiểm tra user đã từng đặt tour chưa
    const booking = await Booking.findOne({
      user: userId,
      tour: tourId,
      status: "paid", // chỉ cho review khi đã thanh toán
    });

    if (!booking) {
      return res.status(400).json({
        message: "Bạn chưa hoàn thành tour này nên không thể đánh giá",
        data: null,
      });
    }

    // 2. Kiểm tra đã review chưa
    const existingReview = await Review.findOne({
      user: userId,
      tour: tourId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Bạn đã đánh giá tour này rồi",
        data: null,
      });
    }

    // 3. Tạo review
    const review = await Review.create({
      user: userId,
      tour: tourId,
      rating,
      comment,
    });

    res.status(201).json({
      message: "Đánh giá thành công",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};
