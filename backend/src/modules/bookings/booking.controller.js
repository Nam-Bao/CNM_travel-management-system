const Booking = require("./booking.model");
const Tour = require("../tours/tour.model");

// 1. Hàm Tạo Booking
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tourId, guest_size, contact_info } = req.body;

    // Chống lỗi tự nhảy dấu cách của VS Code bằng cách dùng &&
    const adult = Number(guest_size && guest_size.adult) || 0;
    const child = Number(guest_size && guest_size.child) || 0;
    const infant = Number(guest_size && guest_size.infant) || 0;

    if (adult < 1) {
      return res.status(400).json({ message: "Phải có ít nhất 1 người lớn." });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: "Tour không tồn tại." });

    // Tính toán giá tiền an toàn
    const adultPrice = ((tour.price && tour.price.adult) || 0) * adult;
    const childPrice = ((tour.price && tour.price.child) || 0) * child;
    const infantPrice = ((tour.price && tour.price.infant) || 0) * infant;

    const basePrice = adultPrice + childPrice + infantPrice;
    const finalPrice = basePrice * (1 - (tour.sale_percentage || 0) / 100);

    if (isNaN(finalPrice)) {
      return res.status(400).json({ message: "Lỗi tính toán giá tour." });
    }

    const booking = await Booking.create({
      user: userId,
      tour: tourId,
      guest_size: { adult, child, infant },
      contact_info,
      total_price: finalPrice,
    });

    res.status(201).json({ message: "🎉 Đặt tour thành công!", data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Hàm Lấy Lịch Sử Booking
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate("tour", "title images duration start_date")
      .sort({ createdAt: -1 });

    res.status(200).json({ status: "success", data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const tour = await Tour.findById(tourId);
if (!tour) return res.status(404).json({ message: "Tour không tồn tại." });

//  Kiểm tra xem tour đã qua ngày khởi hành chưa
const today = new Date();
if (new Date(tour.start_date) < today) {
  return res.status(400).json({
    message: "Rất tiếc, tour này đã khởi hành nên không thể đặt thêm vé.",
  });
}
