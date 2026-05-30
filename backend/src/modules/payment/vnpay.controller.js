const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');
const Booking = require("../bookings/booking.model");
const Tour = require("../tours/tour.model");
const sendTicketEmail = require("../../utils/sendEmail");

exports.createPaymentUrl = async (req, res) => {
    try {
        const { amount, bookingId, bankCode } = req.body;
        
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        
        let ipAddr = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     req.connection.socket.remoteAddress;

        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURN_URL;

        let orderId = bookingId; // Dùng ID đơn đặt tour làm mã đơn hàng VNPay
        let locale = req.body.language || 'vn';
        let currCode = 'VND';
        let vnp_Params = {};

        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don dat tour: ' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu nhân 100
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Sắp xếp các tham số theo thứ tự alphabet để mã hóa chuẩn
        vnp_Params = sortObject(vnp_Params);

        // Tạo chữ ký bảo mật (Hash)
        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        // Tạo URL hoàn chỉnh
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        // Trả URL về cho Frontend
        res.status(200).json({ url: vnpUrl });
        
    } catch (error) {
        console.error("Lỗi tạo link VNPay:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi tạo cổng thanh toán" });
    }
};

// Hàm hỗ trợ sắp xếp Object của VNPay
function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

exports.vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        let secretKey = process.env.VNP_HASH_SECRET;
        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            // Xác thực chữ ký thành công
            if (vnp_Params['vnp_ResponseCode'] === '00') {
                const bookingId = vnp_Params['vnp_TxnRef'];
                
                // 1. Tìm đơn hàng
                const booking = await Booking.findById(bookingId).populate("tour");
                
                if (booking && booking.status === "pending") {
                    // 2. Cập nhật thành công
                    booking.status = "SUCCESS";
                    booking.payment_percent = 100; // Hoặc tùy logic của bạn
                    await booking.save();

                    // 3. 🔥 GỬI EMAIL VÉ ĐIỆN TỬ TẠI ĐÂY 🔥
                    try {
                        const emailData = {
                            _id: booking._id,
                            tour: { title: booking.tour.title, start_date: booking.tour.start_date },
                            contact_info: booking.contact_info,
                            guest_size: booking.guest_size,
                            selected_beds: booking.selected_beds,
                            total_price: booking.total_price,
                            payment_percent: booking.payment_percent
                        };
                        await sendTicketEmail(emailData);
                        console.log("📧 Đã gửi Vé điện tử VNPay cho khách hàng!");
                    } catch (mailError) {
                        console.error("⚠️ Lỗi gửi email VNPay:", mailError);
                    }
                }
                
                // Báo cho Frontend biết là API đã xử lý xong
                return res.status(200).json({ code: "00", message: "Success" });
            } else {
                return res.status(200).json({ code: "24", message: "Giao dịch không thành công" });
            }
        } else {
            return res.status(200).json({ code: "97", message: "Chữ ký không hợp lệ" });
        }
    } catch (error) {
        console.error("Lỗi xử lý VNPay Return:", error);
        return res.status(500).json({ message: "Lỗi Server" });
    }
};