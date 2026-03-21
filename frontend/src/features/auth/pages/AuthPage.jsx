import React, { useState } from "react";
import axiosClient from "../../../services/axiosClient";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [message, setMessage] = useState("");

  // ✅ TỰ ĐỘNG ĐỔI FORM THEO URL
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý khi bấm nút Submit (Đăng nhập / Đăng ký)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Đang xử lý...");

    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/register";

    try {
      // axiosClient đã được cấu hình tự lấy response.data nên ta không cần .data nữa
      const response = await axiosClient.post(url, formData);
      setMessage(`✅ ${response.message}`);

      // Nếu đăng nhập thành công, lưu token vào Local Storage
      if (isLogin && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } catch (error) {
      setMessage(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          {isLogin ? "Đăng Nhập" : "Đăng Ký Tài Khoản"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="full_name"
                placeholder="Họ và tên"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 text-center rounded-md bg-gray-100 text-sm font-medium">
            {message}
          </div>
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
