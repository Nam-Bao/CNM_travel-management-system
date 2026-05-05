import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 text-center tracking-tight">
          🔒 Chính Sách Bảo Mật & Hoàn Hủy
        </h1>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-black text-blue-700 mb-4 border-b pb-2">A. Chính Sách Bảo Mật Thông Tin</h2>
            <p className="mb-3">Tại Traveloke, việc bảo vệ dữ liệu cá nhân của bạn là ưu tiên hàng đầu.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Mục đích thu thập:</strong> Chúng tôi chỉ thu thập các thông tin cần thiết (Họ tên, Số điện thoại, Email) thông qua biểu mẫu đặt tour để phục vụ cho việc giữ chỗ và phát hành Vé điện tử.</li>
              <li><strong>Sử dụng thông tin:</strong> Email của bạn được sử dụng duy nhất để hệ thống tự động gửi Xác nhận đơn hàng và Vé điện tử. Số điện thoại dùng để hướng dẫn viên liên hệ trước giờ khởi hành.</li>
              <li><strong>Bảo mật dữ liệu:</strong> Toàn bộ thông tin cá nhân và lịch sử giao dịch của bạn được mã hóa và lưu trữ an toàn. Chúng tôi cam kết không bán, chia sẻ hay trao đổi dữ liệu cho bất kỳ bên thứ ba nào.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-black text-blue-700 mb-4 border-b pb-2">B. Chính Sách Hoàn/Hủy Tour</h2>
            <p className="mb-3">Chúng tôi hiểu rằng kế hoạch của bạn có thể thay đổi. Hệ thống Traveloke áp dụng chính sách hoàn hủy tự động và minh bạch ngay trên trang "Lịch sử chuyến đi":</p>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-4">
              <ul className="space-y-3 font-medium">
                <li className="flex justify-between border-b border-blue-200 pb-2"><span>Hủy trước 30 ngày:</span> <span className="text-blue-700 font-bold">Hoàn 100% số tiền</span></li>
                <li className="flex justify-between border-b border-blue-200 pb-2"><span>Hủy trước 20 ngày:</span> <span className="text-blue-700 font-bold">Hoàn 50% số tiền</span></li>
                <li className="flex justify-between border-b border-blue-200 pb-2"><span>Hủy trước 15 ngày:</span> <span className="text-blue-700 font-bold">Hoàn 20% số tiền</span></li>
                <li className="flex justify-between text-red-600"><span>Hủy sát ngày (dưới 15 ngày):</span> <span className="font-bold">KHÔNG hoàn tiền</span></li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 italic">
              * Lưu ý: Thời gian hủy được hệ thống tính toán tự động dựa trên thời điểm bạn nhấn nút "Yêu cầu Hủy Tour". Số tiền hoàn lại sẽ được chuyển trả vào tài khoản của quý khách trong vòng 3-5 ngày làm việc.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;