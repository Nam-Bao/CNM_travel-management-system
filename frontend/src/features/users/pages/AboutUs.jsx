import React from "react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
        
        <span className="text-6xl mb-6 block animate-bounce">✈️</span>
        <h1 className="text-3xl md:text-4xl font-black text-blue-700 mb-4 tracking-tight">
          Xin Chào, Chúng Tôi Là Traveloke!
        </h1>
        <p className="text-lg text-gray-500 font-medium mb-10 max-w-2xl mx-auto">
          Được thành lập với khát vọng mang đến những trải nghiệm xê dịch trọn vẹn nhất, Traveloke không chỉ là một nền tảng đặt tour, mà còn là người bạn đồng hành tin cậy trên mọi nẻo đường của bạn.
        </p>

        <div className="text-left space-y-10 text-gray-700 leading-relaxed">
          <section className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Sứ Mệnh Của Chúng Tôi 🎯</h2>
            <p>
              Chúng tôi sinh ra để giải quyết những "điểm đau" truyền thống của ngành du lịch: sự mập mờ về giá cả, tình trạng bán lố vé (overbooking) hay quy trình đặt chỗ rườm rà. Sứ mệnh của Traveloke là ứng dụng công nghệ để tạo ra một hệ sinh thái du lịch <strong>Thông minh - Minh bạch - Nhanh chóng</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Tại Sao Lựa Chọn Traveloke? ⭐</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                <div className="text-3xl mb-3">💺</div>
                <h3 className="font-bold text-gray-900 mb-2">Real-time Booking</h3>
                <p className="text-sm text-gray-600">Sơ đồ xe được cập nhật chính xác đến từng giây. Bạn thấy ghế trống, nghĩa là nó thuộc về bạn!</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                <div className="text-3xl mb-3">💳</div>
                <h3 className="font-bold text-gray-900 mb-2">Thanh toán linh hoạt</h3>
                <p className="text-sm text-gray-600">Tích hợp VNPay an toàn, cho phép linh hoạt đặt cọc 50% hoặc thanh toán toàn bộ 100%.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                <div className="text-3xl mb-3">📧</div>
                <h3 className="font-bold text-gray-900 mb-2">Vé điện tử tự động</h3>
                <p className="text-sm text-gray-600">Mọi xác nhận đều được gửi trực tiếp đến hộp thư cá nhân của bạn dưới dạng Vé điện tử chuyên nghiệp.</p>
              </div>
            </div>
          </section>

          <section className="text-center pt-8 border-t">
            <p className="text-lg font-bold text-gray-800 mb-6">
              Dù bạn đang tìm kiếm một chuyến nghỉ dưỡng chữa lành, hay một hành trình khám phá quốc tế, Traveloke luôn sẵn sàng "giữ chỗ" cho những kỷ niệm tuyệt vời nhất của bạn.
            </p>
            <Link to="/" className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 transition-all">
              Bắt đầu khám phá Tour ngay
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;