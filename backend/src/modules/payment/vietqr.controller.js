const Booking = require("../bookings/booking.model"); 
const Tour = require("../tours/tour.model"); 
const sendTicketEmail = require("../../utils/sendEmail");

// [POST] /api/payment/sepay-webhook
const verifySePayWebhook = async (req, res) => {
    try {
        // 1. BẢO MẬT: Kiểm tra token
        const authHeader = req.headers.authorization;
        const mySepayToken = process.env.SEPAY_API_TOKEN; 

        if (!authHeader || !authHeader.includes(mySepayToken)) {
            console.log("❌ Cảnh báo: Có kẻ giả mạo Webhook SePay!");
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        console.log("✅ Đã nhận được thông báo biến động số dư từ SePay!");
        
        // 2. 🔥 SỬA LỖI Ở ĐÂY: Dùng đúng tên trường dữ liệu của SePay 🔥
        const { transferAmount, content } = req.body;

        // Nếu đây là giao dịch chuyển tiền vào (transferAmount > 0)
        if (transferAmount > 0) {
            console.log(`💰 Có tiền vào: +${transferAmount} VND. Nội dung: ${content}`);

            // 3. Trích xuất mã đơn hàng
            // Dựa vào log của bạn: "1310659...-TT TOUR AF8333-CHUYEN TIEN..."
            // Hàm match này sẽ tóm gọn đúng cụm "AF8333"
            const contentUpper = content.toUpperCase();
            const match = contentUpper.match(/TOUR\s*([A-Z0-9]{6})/);
            
            if (match) {
                const bookingCode = match[1];
                console.log(`🔍 Đang tìm đơn hàng có đuôi mã là: ${bookingCode}`);

                // 4. Tìm đơn hàng (ĐÃ SỬA LỖI $regex)
                // Lấy tất cả đơn đang pending ra trước
                const pendingBookings = await Booking.find({ status: "pending" });
                
                // Dùng hàm find của mảng Javascript để tìm đuôi mã ID
                const booking = pendingBookings.find(b => 
                    b._id.toString().toUpperCase().endsWith(bookingCode)
                );

                if (booking) {
                    // 5. Kiểm tra giá tiền thực tế khách cần thanh toán
                    const amountNeeded = (booking.total_price * booking.payment_percent) / 100;

                    if (transferAmount >= amountNeeded) {
                        // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG THÀNH CÔNG
                        booking.status = "SUCCESS"; 
                        await booking.save();
                        console.log(`🎉 XÁC NHẬN THÀNH CÔNG: Đã duyệt tự động đơn hàng ${booking._id}`);

                        // 6. Gửi Email Vé điện tử
                        try {
                            const tour = await Tour.findById(booking.tour);
                            if(tour) {
                                const emailData = {
                                    _id: booking._id,
                                    tour: { title: tour.title, start_date: tour.start_date },
                                    contact_info: booking.contact_info,
                                    guest_size: booking.guest_size,
                                    selected_beds: booking.selected_beds,
                                    total_price: booking.total_price,
                                    payment_percent: booking.payment_percent
                                };
                                sendTicketEmail(emailData);
                                console.log("📧 Đã gửi Vé điện tử cho khách hàng!");
                            }
                        } catch (mailError) {
                            console.error("⚠️ Lỗi gửi email:", mailError);
                        }

                    } else {
                        console.log(`⚠️ Đơn hàng ${booking._id} khách chuyển THIẾU TIỀN (Cần: ${amountNeeded}, Nhận: ${transferAmount})`);
                    }
                } else {
                    console.log(`❌ Không tìm thấy đơn hàng Pending nào khớp với mã ${bookingCode}`);
                }
            } else {
                console.log(`❌ Không tìm thấy mã TOUR hợp lệ trong nội dung: ${contentUpper}`);
            }
        } else {
            console.log("⚠️ Đây không phải là giao dịch cộng tiền.");
        }

        // Luôn trả về 200 cho SePay
        res.status(200).json({ success: true, message: "Webhook processed" });

    } catch (error) {
        console.error("❌ Lỗi xử lý Webhook:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    verifySePayWebhook
};