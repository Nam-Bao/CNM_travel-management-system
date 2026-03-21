import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../../services/axiosClient";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Đang xử lý...");

    try {
      const url = isLogin ? "/auth/login" : "/auth/register";

      const response = await axiosClient.post(url, formData);

      setMessage(`✅ ${response.message}`);

      // ✅ LOGIN THÀNH CÔNG
      if (isLogin && response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        navigate("/"); // chuyển về trang chủ
      }

      // ✅ REGISTER → chuyển sang login
      if (!isLogin) {
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          {isLogin ? "Đăng Nhập" : "Đăng Ký"}
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
                className="w-full px-4 py-2 border rounded-md"
              />
              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            {isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </button>
        </form>

        {message && <div className="mt-4 text-center text-sm">{message}</div>}

        <p className="text-center text-sm mt-4">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}

          <button
            onClick={() => navigate(isLogin ? "/register" : "/login")}
            className="text-blue-600 ml-1"
          >
            {isLogin ? "Đăng ký" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
