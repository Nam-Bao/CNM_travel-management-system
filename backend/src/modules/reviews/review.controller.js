const Review = require("./review.model");
const Booking = require("../bookings/booking.model");
const Tour = require("../tours/tour.model"); // Cần import model Tour để check ngày

// ===============================
// THÊM REVIEW
// ===============================
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tourId, rating, comment } = req.body;

    // 1. Kiểm tra user đã từng đặt tour chưa (Ví dụ của bạn là cần có status 'paid', nhưng nếu schema chưa có status, bỏ điều kiện này đi, ở đây mình giữ theo code bạn gửi)
    const booking = await Booking.findOne({
      user: userId,
      tour: tourId,
      // status: "paid", // MỞ lại nếu Schema Booking của bạn CÓ trường status. Nếu không có sẽ lỗi tìm không ra. Tạm thời mình ẩn để an toàn.
    });

    if (!booking) {
      return res.status(400).json({
        message: "Bạn chưa hoàn thành tour này nên không thể đánh giá",
        data: null,
      });
    }

    // --- MỚI: Kiểm tra ngày khởi hành của Tour ---
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res
        .status(404)
        .json({ message: "Tour không tồn tại", data: null });
    }
    const today = new Date();
    if (new Date(tour.start_date) > today) {
      return res.status(400).json({
        message:
          "Chuyến đi chưa diễn ra, vui lòng quay lại đánh giá sau khi kết thúc tour nhé!",
        data: null,
      });
    }

    // 2. Kiểm tra đã review chưa (1 user 1 review cho 1 tour)
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

// ===============================
// LẤY DANH SÁCH REVIEW CỦA 1 TOUR
// ===============================
exports.getTourReviews = async (req, res) => {
  try {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour: tourId })
      .populate("user", "username full_name avatar") // Lấy thông tin user
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json({
      message: "Lấy đánh giá thành công",
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};
