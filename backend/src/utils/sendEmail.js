const nodemailer = require("nodemailer");

const sendTicketEmail = async (bookingData) => {
  try {
    // 1. Cấu hình "Người giao thư" (Transporter)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Format lại các dữ liệu hiển thị
    const { email, full_name, phone } = bookingData.contact_info;
    const { adult, child, infant } = bookingData.guest_size;
    const formatPrice = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(bookingData.total_price);
    const startDate = new Date(bookingData.tour.start_date).toLocaleDateString("vi-VN");
    
    const guestDetails = [];
    if (adult > 0) guestDetails.push(`${adult} Người lớn`);
    if (child > 0) guestDetails.push(`${child} Trẻ em`);
    if (infant > 0) guestDetails.push(`${infant} Em bé`);

    const seatDisplay = bookingData.selected_beds?.length > 0 
        ? bookingData.selected_beds.join(", ") 
        : "Hãng bay tự động sắp xếp";

    // 3. Mã HTML thiết kế giao diện Vé Điện Tử
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-w-width: 600px; margin: 0 auto; background-color: #f4f7f6; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background-color: #2563eb; padding: 25px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">TRAVELOKE</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Xác nhận đặt vé thành công</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Xin chào <strong>${full_name}</strong>,</p>
            <p style="color: #555; line-height: 1.6;">Cảm ơn bạn đã tin tưởng và lựa chọn Traveloke. Dưới đây là thông tin chi tiết vé điện tử của bạn. Vui lòng xuất trình email này khi lên xe/máy bay.</p>
            
            <!-- Ticket Card -->
            <div style="border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; margin-top: 25px; background-color: #f8fafc;">
              <h2 style="color: #1e40af; font-size: 18px; margin-top: 0;">${bookingData.tour.title}</h2>
              
              <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 40%;">Mã Đơn Hàng:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">#${bookingData._id.toString().slice(-6).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Ngày khởi hành:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${startDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Hành khách:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${guestDetails.join(", ")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Vị trí ghế:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #2563eb;">${seatDisplay}</td>
                </tr>
              </table>
            </div>

            <!-- Payment Info -->
            <div style="margin-top: 25px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
                Trạng thái: <strong>${bookingData.payment_percent === 50 ? 'Đã cọc 50%' : 'Đã thanh toán 100%'}</strong>
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #1e3a8a;">
                Tổng tiền tour: <strong style="font-size: 18px; color: #dc2626;">${formatPrice}</strong>
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 13px; color: #94a3b8; text-align: center;">
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ hotline: 1900 1234.
            </p>
          </div>
        </div>
      </div>
    `;

    // 4. Thực thi Gửi Email
    const mailOptions = {
      from: `"Traveloke Booking" <${process.env.EMAIL_USER}>`,
      to: email, // Gửi đến email khách hàng nhập ở form
      subject: `✈️ Vé Điện Tử: ${bookingData.tour.title}`,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email đã được gửi thành công: " + info.response);
    return true;

  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    return false;
  }
};

module.exports = sendTicketEmail;