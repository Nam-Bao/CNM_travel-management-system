const Booking = require("./booking.model");
const Tour = require("../tours/tour.model");
const sendTicketEmail = require("../../utils/sendEmail");

// 1. HÀM TẠO BOOKING
exports.createBooking = async(req, res) => {
    try {
        const {
            tourId,
            selected_beds,
            guest_size,
            contact_info,
            hotel_addon,
            payment_percent,
            payment_method,
            userId
        } = req.body;

        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Không tìm thấy tour" });

        // Parse guest count safely
        let adult = 0,
            child = 0,
            infant = 0;
        if (guest_size) {
            adult = Number(guest_size.adult || 0);
            child = Number(guest_size.child || 0);
            infant = Number(guest_size.infant || 0);
        }
        const totalGuests = adult + child + infant;
        if (totalGuests === 0) {
            return res.status(400).json({ message: "Số lượng khách phải lớn hơn 0" });
        }

        let couplePrice = 0;
        let updatedTour = null;

        // LOGIC PHÂN LOẠI THEO TOUR_TYPE
        if (tour.tour_type === "domestic") {
            // TOUR TRONG NƯỚC: Bắt buộc chọn giường/ghế
            if (!selected_beds || selected_beds.length !== totalGuests) {
                return res.status(400).json({
                    message: `Vui lòng chọn đủ ${totalGuests} vị trí giường/ghế.`
                });
            }

            // Kiểm tra tất cả ghế tồn tại
            const invalidSeats = selected_beds.filter(
                code => !tour.beds.find(b => b.code === code)
            );
            if (invalidSeats.length > 0) {
                return res.status(400).json({
                    message: `Ghế không tồn tại: ${invalidSeats.join(", ")}`
                });
            }

            // Kiểm tra ghế chưa bị đặt
            const bookedSeats = selected_beds.filter(
                code => tour.beds.find(b => b.code === code && b.isBooked)
            );
            if (bookedSeats.length > 0) {
                return res.status(400).json({
                    message: `Ghế đã bị đặt: ${bookedSeats.join(", ")}`
                });
            }

            // Tính phụ phí giường đôi (chỉ khi là giường nằm)
            if (tour.vehicle_type === "bed" && tour.couple_bed_price) {
                selected_beds.forEach((code) => {
                    const bed = tour.beds.find((b) => b.code === code);
                    if (bed && bed.type === "double") {
                        couplePrice += tour.couple_bed_price;
                    }
                });
            }

            // Cập nhật trạng thái giường & giảm chỗ trống
            updatedTour = await Tour.findOneAndUpdate({
                _id: tourId,
                available_seats: { $gte: totalGuests },
            }, {
                $inc: { available_seats: -totalGuests },
                $set: { "beds.$[elem].isBooked": true },
            }, {
                arrayFilters: [{ "elem.code": { $in: selected_beds } }],
                new: true,
            });

            if (!updatedTour) {
                return res.status(400).json({
                    message: "Chỗ ngồi đã bị người khác đặt hoặc hết chỗ!"
                });
            }
        } else {
            // TOUR NƯỚC NGOÀI: Không cần chọn ghế, chỉ giảm available_seats
            if (tour.available_seats < totalGuests) {
                return res.status(400).json({ message: "Tour quốc tế đã hết chỗ!" });
            }

            updatedTour = await Tour.findByIdAndUpdate(
                tourId, { $inc: { available_seats: -totalGuests } }, { new: true }
            );

            if (!updatedTour) {
                return res.status(400).json({ message: "Tour không tồn tại hoặc hết chỗ!" });
            }
        }

        // TÍNH TOÁN GIÁ TIỀN
        const priceData = updatedTour.price || {};
        const adultPrice = (Number(priceData.adult) || 0) * adult;
        const childPrice = (Number(priceData.child) || 0) * child;
        const infantPrice = (Number(priceData.infant) || 0) * infant;
        const hotelPrice = (hotel_addon && Number(hotel_addon.price_per_night)) || 0;

        const baseTotal = adultPrice + childPrice + infantPrice + hotelPrice + couplePrice;
        const finalPrice = baseTotal * (1 - (updatedTour.sale_percentage || 0) / 100);

        // LƯU ĐƠN ĐẶT TOUR
        const doubleBedCodes = selected_beds?.filter(code => {
            const bed = tour.beds?.find(b => b.code === code);
            return bed?.type === "double";
        }) || [];

        const booking = await Booking.create({
            user: userId || (req.user && req.user.id),
            tour: tourId,
            guest_size: { adult, child, infant },
            selected_seats: selected_beds || [],
            selected_beds: selected_beds || [],
            couple_beds: doubleBedCodes,
            couple_price: couplePrice,
            hotel_addon: hotel_addon || {},
            contact_info: contact_info,
            total_price: finalPrice,
            payment_percent: payment_percent || 100, 
            payment_method: payment_method || "VNPAY",
            status: "pending"
        });

        // LUỒNG GỬI EMAIL VÉ ĐIỆN TỬ 
        try {
            // Gom dữ liệu từ Database vừa tạo và biến 'tour' (đã query ở trên)
            const emailData = {
                _id: booking._id,
                tour: {
                    title: tour.title,          // Tên tour lấy từ biến tour
                    start_date: tour.start_date // Ngày đi lấy từ biến tour
                },
                contact_info: booking.contact_info,
                guest_size: booking.guest_size,
                selected_beds: booking.selected_beds,
                total_price: booking.total_price,
                payment_percent: booking.payment_percent
            };

            // Gọi hàm gửi email (Cố tình KHÔNG dùng chữ 'await' ở đây)
            // Việc này giúp API trả kết quả về cho React ngay lập tức mà không bắt khách hàng phải chờ 3-5 giây gửi mail.
            sendTicketEmail(emailData);
            console.log("Đã kích hoạt luồng gửi vé điện tử chạy ngầm!");

        } catch (mailError) {
            console.error("Lỗi gửi email nhưng đơn hàng vẫn thành công:", mailError);
        }

        res.status(201).json({
            success: true,
            message: "🎉 Đặt tour thành công!",
            data: booking
        });

    } catch (error) {
        console.error("Error at createBooking:", error);
        res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
    }
};

// 2. LẤY LỊCH SỬ (MY BOOKINGS)
exports.getMyBookings = async(req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate("tour", "title images duration start_date")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. HỦY TOUR & HOÀN CHỖ
exports.cancelBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate("tour");
        if (!booking || booking.status === "CANCELED") {
            return res.status(404).json({ message: "Đơn hàng không tồn tại hoặc đã hủy!" });
        }

        const totalReturn = booking.guest_size.adult + booking.guest_size.child + booking.guest_size.infant;

        // Hoàn trả available_seats
        const updateData = { $inc: { available_seats: totalReturn } };
        const options = {};

        // Nếu tour trong nước có chọn ghế, reset trạng thái
        if (booking.selected_beds && booking.selected_beds.length > 0) {
            updateData.$set = { "beds.$[elem].isBooked": false };
            options.arrayFilters = [{ "elem.code": { $in: booking.selected_beds } }];
        }

        await Tour.findByIdAndUpdate(booking.tour._id, updateData, options);

        booking.status = "CANCELED";
        await booking.save();

        res.status(200).json({ message: "Đã hủy thành công và hoàn trả vị trí chỗ ngồi." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. ADMIN: LẤY TẤT CẢ BOOKINGS
exports.getAllBookings = async(req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("user", "username full_name email")
            .populate("tour", "title start_date duration")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};