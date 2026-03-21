const Booking = require("./booking.model");
const Tour = require("../tours/tour.model");

// ===============================
// TẠO BOOKING
// ===============================
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ token
    const { tourId, booking_date, number_of_people } = req.body;

    // kiểm tra tour tồn tại
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({
        message: "Tour không tồn tại",
        data: null,
      });
    }

    // kiểm tra số chỗ còn
    if (tour.available_seats < number_of_people) {
      return res.status(400).json({
        message: "Không đủ chỗ",
        data: null,
      });
    }

    // tính tổng tiền
    const totalPrice = tour.price * number_of_people;

    // tạo booking
    const booking = await Booking.create({
      user: userId,
      tour: tourId,
      booking_date,
      number_of_people,
      total_price: totalPrice,
    });

    // trừ số ghế còn lại
    tour.available_seats -= number_of_people;
    await tour.save();

    res.status(201).json({
      message: "Đặt tour thành công",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

// ===============================
// LẤY LỊCH SỬ BOOKING
// ===============================
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user: userId })
      .populate("tour") // lấy thông tin tour
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách booking thành công",
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};
