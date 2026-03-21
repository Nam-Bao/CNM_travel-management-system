import React, { useState } from "react";
import tourApi from "../api/tourApi";

const AddTourPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    image_url: "",
    max_seats: "",
    available_seats: "",
    start_date: "",
  });

  // 1. Thêm State để lưu trữ file ảnh người dùng chọn từ máy tính
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");

  // 2. Thêm State Loading để khóa nút bấm trong lúc đang up ảnh lên Cloud
  const [loading, setLoading] = useState(false);

  // Hàm xử lý khi gõ chữ
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý riêng khi chọn File
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Đang lưu dữ liệu và tải ảnh lên đám mây. Vui lòng đợi...");
    setLoading(true);

    try {
      // SỰ KHÁC BIỆT LỚN NHẤT: Khởi tạo FormData thay vì JSON thông thường
      const data = new FormData();

      // Nhét toàn bộ dữ liệu chữ (title, price...) vào gói hàng
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Nếu người dùng có chọn File, nhét tiếp File vào gói hàng.
      // LƯU Ý: Tên 'image' ở đây phải khớp 100% với chữ uploadCloud.single('image') ở Backend!
      if (imageFile) {
        data.append("image", imageFile);
      }

      // Gửi cả gói hàng bự này qua API
      const response = await tourApi.createTour(data);

      setMessage(`✅ ${response.message}`);

      // Reset form sau khi thành công
      setFormData({
        title: "",
        description: "",
        price: "",
        duration: "",
        image_url: "",
        max_seats: "",
        available_seats: "",
        start_date: "",
      });
      setImageFile(null);
      document.getElementById("file-upload").value = ""; // Xóa tên file vừa hiển thị
    } catch (error) {
      setMessage(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
          Thêm Tour Du Lịch Mới
        </h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg font-medium ${message.includes("✅") ? "bg-green-100 text-green-700" : message.includes("⏳") ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Cột trái */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Tour *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá tiền (VNĐ) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả Tour *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                disabled={loading}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>
          </div>

          {/* Cột phải */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tổng số vé *
                </label>
                <input
                  type="number"
                  name="max_seats"
                  value={formData.max_seats}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vé trống *
                </label>
                <input
                  type="number"
                  name="available_seats"
                  value={formData.available_seats}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày khởi hành *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* KHU VỰC THÊM ẢNH (VỪA LINK VỪA FILE) */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📸 Hình ảnh minh họa (Chọn 1 trong 2)
              </label>

              {/* Option 1: Chọn File từ máy */}
              <div className="mb-3">
                <span className="text-xs text-gray-500 mb-1 block">
                  Tải ảnh từ máy tính (Ưu tiên):
                </span>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="text-center text-gray-400 text-xs font-bold my-2">
                HOẶC
              </div>

              {/* Option 2: Nhập Link URL */}
              <div>
                <span className="text-xs text-gray-500 mb-1 block">
                  Nhập Link URL ảnh có sẵn:
                </span>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  disabled={loading || imageFile !== null}
                  className={`w-full px-4 py-2 border rounded-md outline-none text-sm ${imageFile ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500"}`}
                  placeholder={
                    imageFile ? "Đã chọn file máy tính" : "https://..."
                  }
                />
              </div>
            </div>
          </div>

          {/* Nút Submit */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-3 rounded-md transition duration-300 shadow-md ${loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              {loading ? "Đang xử lý..." : "➕ Thêm Tour Mới Vào Hệ Thống"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTourPage;
