import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Lấy thông tin user từ LocalStorage
  useEffect(() => {
    const checkLoginStatus = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Lỗi đọc thông tin user", e);
        }
      }
    };
    checkLoginStatus();

    // Lắng nghe sự kiện để cập nhật Header ngay lập tức khi đăng nhập/đăng xuất
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
      navigate("/");
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        {/* LOGO */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-blue-600 tracking-tighter"
        >
          Travel<span className="text-orange-500">oke</span>
        </Link>

        {/* THANH NAVIGATION CHO KHÁCH HÀNG */}
        <nav className="hidden md:flex items-center gap-8 font-bold text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition">
            Trang chủ
          </Link>

          {/* MỤC KHÁCH SẠN MỚI THÊM */}
          <Link
            to="/hotels"
            className="hover:text-blue-600 transition flex items-center gap-1"
          >
            Khách sạn
          </Link>

          {/* <Link to="/tours" className="hover:text-blue-600 transition">
            Khám phá Tour
          </Link> */}
          <Link to="/about" className="hover:text-blue-600 transition">
            Về chúng tôi
          </Link>
        </nav>

        {/* KHU VỰC USER / LOGIN */}
        <div className="flex items-center gap-6">
          {currentUser ? (
            <div className="flex items-center gap-4 bg-gray-50 p-1.5 pr-4 rounded-full border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {currentUser.full_name?.charAt(0) || "U"}
              </div>
              <div className="hidden md:block leading-tight">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Thành viên
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {currentUser.full_name}
                </p>
              </div>

              <div className="hidden md:flex items-center mx-2 pl-4 border-l border-gray-200 gap-4">
                <Link
                  to="/my-bookings"
                  className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider flex items-center gap-1"
                >
                  <span>✈️</span> Lịch sử
                </Link>
                {currentUser.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-blue-600 font-bold text-xs uppercase tracking-wider"
                  >
                    ⚙️ Quản trị
                  </Link>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="ml-2 text-red-500 hover:text-red-700 font-bold text-xs uppercase border-l pl-4 border-gray-200"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:shadow-lg transition text-sm"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
