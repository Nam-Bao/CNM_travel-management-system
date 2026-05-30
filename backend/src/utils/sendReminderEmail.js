const nodemailer = require("nodemailer");

const sendReminderEmail = async (bookingData) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const { email, full_name } = bookingData.contact_info;
    const formatPrice = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(bookingData.total_price / 2);
    const startDate = new Date(bookingData.tour.start_date).toLocaleDateString("vi-VN");

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff7ed; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 6px solid #ea580c;">
          
          <div style="padding: 25px; text-align: center; background-color: #fff7ed;">
            <h1 style="margin: 0; font-size: 24px; color: #ea580c; letter-spacing: 1px;">TRAVELOKE</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #9a3412; font-weight: bold; uppercase">🔔 THÔNG BÁO NHẮC NHỞ THANH TOÁN ĐỐI VỚI ĐƠN HÀNG ĐÃ ĐẶT</p>
          </div>

          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Xin chào <strong>${full_name}</strong>,</p>
            <p style="color: #555; line-height: 1.6;">Hệ thống Traveloke ghi nhận chuyến đi của bạn sắp khởi hành. Theo quy định đã đặt ra, quý khách cần hoàn tất 50% chi phí còn lại của tour <strong>trước ngày khởi hành 7 ngày</strong>.</p>
            
            <div style="border: 1px solid #fed7aa; border-radius: 10px; padding: 20px; margin-top: 25px; background-color: #fffaf5;">
              <h2 style="color: #c2410c; font-size: 18px; margin-top: 0; margin-bottom: 10px;">${bookingData.tour.title}</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Mã đơn hàng:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">#${bookingData._id.toString().slice(-6).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Ngày khởi hành:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${startDate}</td>
                </tr>
                <tr style="border-top: 1px dashed #fed7aa;">
                  <td style="padding: 10px 0 0 0; color: #ea580c; font-weight: bold;">Số tiền còn lại cần đóng:</td>
                  <td style="padding: 10px 0 0 0; font-weight: bold; color: #dc2626; font-size: 18px;">${formatPrice}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 25px; padding: 15px; background-color: #ffedd5; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #9a3412; font-weight: bold;">
                ⚠️ Hạn chót đóng tiền tại văn phòng công ty hoặc chuyển khoản trực tuyến là trước ngày khởi hành 7 ngày.
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 13px; color: #94a3b8; text-align: center;">
              Nếu bạn đã thanh toán, vui lòng bỏ qua email này hoặc liên hệ hotline: 1900 1234 để được hỗ trợ.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Traveloke Reminder" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔔 [Nhắc nhở thanh toán] Chuyến đi ${bookingData.tour.title} sắp khởi hành`,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Lỗi khi gửi email nhắc nhở:", error);
    return false;
  }
};

module.exports = sendReminderEmail;