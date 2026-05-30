const cron = require("node-cron");
const Booking = require("../modules/bookings/booking.model"); // Sửa đường dẫn import cho đúng dự án của bạn
const Tour = require("../modules/tours/tour.model");
const sendReminderEmail = require("../utils/sendReminderEmail");

const initReminderCronJob = () => {
    // Cấu hình: Chạy tự động vào lúc 08:00 sáng mỗi ngày  */2 * * * *
    // Cấu trúc chuỗi biểu thức: (Phút | Giờ | Ngày trong tháng | Tháng | Ngày trong tuần)
    cron.schedule("0 8 * * *", async () => {
        console.log("⏰ [Cron Job] Đang tiến hành quét đơn hàng để gửi nhắc nhở 10 ngày trước chuyến đi...");
        
        try {
            // 1. Tính toán mốc thời gian của ngày thứ 10 tính từ hôm nay
            const targetDateStart = new Date();
            targetDateStart.setDate(targetDateStart.getDate() + 10);
            targetDateStart.setHours(0, 0, 0, 0); // Đầu ngày thứ 10

            const targetDateEnd = new Date(targetDateStart);
            targetDateEnd.setHours(23, 59, 59, 999); // Cuối ngày thứ 10

            // 2. Tìm tất cả các Tour khởi hành vào đúng ngày thứ 10 đó
            const toursInTargetDay = await Tour.find({
                start_date: { $gte: targetDateStart, $lte: targetDateEnd }
            });

            if (toursInTargetDay.length === 0) {
                console.log("➡️ [Cron Job] Không có tour nào khởi hành sau 10 ngày nữa. Kết thúc công việc.");
                return;
            }

            // Gom hết tất cả ID của các tour tìm được thành 1 mảng
            const tourIds = toursInTargetDay.map(tour => tour._id);

            // 3. Quét Database tìm đơn hàng thỏa mãn: 
            // Thuộc danh sách Tour trên, mới đóng 50% tiền, và trạng thái chưa bị hủy
            const bookingsToRemind = await Booking.find({
                tour: { $in: tourIds },
                payment_percent: 50,
                status: { $ne: "CANCELED" }
            }).populate("tour");

            console.log(`🔍 [Cron Job] Tìm thấy ${bookingsToRemind.length} đơn hàng cần nhắc nhở đóng nốt tiền.`);

            // 4. Duyệt mảng đơn hàng để kích hoạt luồng gửi mail tự động
            for (const booking of bookingsToRemind) {
                console.log(`📧 [Cron Job] Đang gửi mail nhắc nhở cho khách hàng: ${booking.contact_info.full_name} (#${booking._id.toString().slice(-6).toUpperCase()})`);
                await sendReminderEmail(booking);
            }
            
            console.log("✅ [Cron Job] Đã hoàn tất công việc gửi email nhắc nhở ngày hôm nay!");

        } catch (error) {
            console.error("❌ [Cron Job] Gặp lỗi trong quá trình quét tự động:", error);
        }
    });
};

module.exports = initReminderCronJob;