import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tighter mb-4">
            Travel<span className="text-orange-500">oke</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Nền tảng đặt tour du lịch hàng đầu, mang đến cho bạn những trải nghiệm tuyệt vời nhất trên mỗi hành trình.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Liên Hệ</h3>
          <p className="text-sm">📍 123 Nguyễn Văn Bảo, Gò Vấp, TP.HCM</p>
          <p className="text-sm mt-2">📞 Hotline: 1900 1234</p>
          <p className="text-sm mt-2">✉️ Email: support@traveloke.vn</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Chính Sách</h3>
          <ul className="text-sm space-y-2">
            <li><a href="#" className="hover:text-white transition">Điều khoản sử dụng</a></li>
            <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-white transition">Chính sách hoàn hủy</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs border-t border-gray-700 mt-8 pt-8">
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} TRAVELOKE PLATFORM - PHÁT TRIỂN BỞI SINH VIÊN IUH</p>
      </div>
    </footer>
  );
};

export default Footer;