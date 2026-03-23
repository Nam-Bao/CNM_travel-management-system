const Booking = require("./booking.model");
const Tour = require("../tours/tour.model");

// 1. Hàm Tạo Booking
// 1. Hàm Tạo Booking
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tourId, guest_size, contact_info } = req.body;

    const adult = Number(guest_size && guest_size.adult) || 0;
    const child = Number(guest_size && guest_size.child) || 0;
    const infant = Number(guest_size && guest_size.infant) || 0;

    if (adult < 1) {
      return res.status(400).json({ message: "Phải có ít nhất 1 người lớn." });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: "Tour không tồn tại." });

    const today = new Date();
    if (new Date(tour.start_date) < today) {
      return res.status(400).json({
        message: "Rất tiếc, tour này đã khởi hành nên không thể đặt thêm vé.",
      });
    }

    // ✅ XỬ LÝ YÊU CẦU 2: TRỪ SỐ LƯỢNG VÉ CÒN TRỐNG (ATOMIC UPDATE)
    const seatsToReserve = adult + child + infant; 
    
    if (seatsToReserve === 0) {
      return res.status(400).json({ message: "Dữ liệu đoàn khách không hợp lệ." });
    }
    
    // Yêu cầu MongoDB tìm Tour này, ĐỒNG THỜI kiểm tra vé có đủ không, VÀ trừ vé đi
    const updatedTour = await Tour.findOneAndUpdate(
      { 
        _id: tourId, 
        available_seats: { $gte: seatsToReserve } // Phải còn đủ vé trống
      },
      { 
        $inc: { available_seats: -seatsToReserve } // Trừ đi số lượng khách
      },
      { 
        returnDocument: 'after', 
        runValidators: true
      }
    );

    // Nếu không tìm thấy updatedTour, nghĩa là ai đó đã nhanh tay mua hết vé
    if (!updatedTour) {
      return res.status(400).json({ 
        message: "Rất tiếc, tour này đã hết chỗ hoặc không đủ số lượng vé bạn cần!" 
      });
    }

    // Tính toán giá tiền dựa trên data MỚI NHẤT (updatedTour)
    const adultPrice = ((updatedTour.price && updatedTour.price.adult) || 0) * adult;
    const childPrice = ((updatedTour.price && updatedTour.price.child) || 0) * child;
    const infantPrice = ((updatedTour.price && updatedTour.price.infant) || 0) * infant;

    const basePrice = adultPrice + childPrice + infantPrice;
    const finalPrice = basePrice * (1 - (updatedTour.sale_percentage || 0) / 100);

    if (isNaN(finalPrice)) {
      // Rollback: Nếu tính tiền bị lỗi, cộng trả lại số vé cho tour
      await Tour.findByIdAndUpdate(tourId, { $inc: { available_seats: seatsToReserve } });
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

// 3. Hàm Lấy TẤT CẢ Booking (Dành riêng cho Admin)
exports.getAllBookings = async (req, res) => {
  try {
    // Tìm tất cả, không lọc theo userId
    const bookings = await Booking.find()
      .populate("user", "username full_name email") // Kéo thêm thông tin người dùng
      .populate("tour", "title start_date duration") // Kéo thêm thông tin tour
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json({ status: "success", data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hàm xử lý Hủy đặt tour của Khách hàng
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    // Tìm đơn hàng và "kéo" theo thông tin tour để lấy ngày khởi hành
    const booking = await Booking.findById(bookingId).populate("tour");

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt tour" });
    }

    // Kiểm tra xem đơn đã bị hủy trước đó chưa
    if (booking.status === "CANCELED") {
      return res.status(400).json({ message: "Đơn này đã được hủy trước đó." });
    }

    const tour = booking.tour;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(tour.start_date);
    startDate.setHours(0, 0, 0, 0);

    // Tính toán số ngày từ hôm nay đến ngày khởi hành
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Nếu ngày khởi hành đã qua hoặc là ngày hôm nay thì khóa không cho hủy
    if (diffDays <= 0) {
      return res.status(400).json({ message: "Tour đã khởi hành, không thể hủy." });
    }

    // LOGIC TÍNH PHẦN TRĂM HOÀN TIỀN
    let refundPercentage = 0;
    if (diffDays >= 30) {
      refundPercentage = 100;
    } else if (diffDays >= 20) {
      refundPercentage = 50;
    } else if (diffDays >= 15) {
      refundPercentage = 20;
    } else {
      refundPercentage = 0; // Hủy sát ngày (dưới 15 ngày) sẽ mất 100% tiền
    }

    // Cập nhật trạng thái đơn hàng
    booking.status = "CANCELED";
    booking.refund_percentage = refundPercentage;
    booking.refund_amount = (booking.total_price * refundPercentage) / 100;
    await booking.save();

    // RẤT QUAN TRỌNG: Trả lại số ghế trống (available_seats) cho Tour
    const totalTickets = (booking.guest_size?.adult || 0) + (booking.guest_size?.child || 0) + (booking.guest_size?.infant || 0);
    tour.available_seats += totalTickets;
    await tour.save();

    res.status(200).json({
      status: "success",
      message: `Đã hủy tour thành công. Bạn được hoàn ${refundPercentage}% tiền.`,
      data: booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};