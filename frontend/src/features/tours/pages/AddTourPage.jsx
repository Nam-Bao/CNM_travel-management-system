import React, { useState } from 'react';
import tourApi from '../api/tourApi';

const AddTourPage = () => {
    // Lưu trữ dữ liệu người dùng nhập
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        duration: '',
        image_url: '',
        max_seats: '',
        available_seats: '',
        start_date: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Đang lưu dữ liệu...');
        try {
            // Gọi API bằng axiosClient đã setup tự động nhét Token
            const response = await tourApi.createTour(formData);
            setMessage(`✅ ${response.message}`);
            // Reset form sau khi thêm thành công
            setFormData({
                title: '', description: '', price: '', duration: '', 
                image_url: '', max_seats: '', available_seats: '', start_date: ''
            });
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                    Thêm Tour Du Lịch Mới
                </h2>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg font-medium ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột trái */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Tour *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Khám phá Vịnh Hạ Long" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá tiền (VNĐ) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 1500000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian *</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} required
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 3 ngày 2 đêm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả Tour *</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nhập lịch trình chi tiết..."></textarea>
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số vé *</label>
                                <input type="number" name="max_seats" value={formData.max_seats} onChange={handleChange} required
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vé còn trống *</label>
                                <input type="number" name="available_seats" value={formData.available_seats} onChange={handleChange} required
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày khởi hành *</label>
                            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link Ảnh (URL)</label>
                            <input type="text" name="image_url" value={formData.image_url} onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
                        </div>
                    </div>

                    {/* Nút Submit trải dài 2 cột */}
                    <div className="md:col-span-2 mt-4">
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition duration-300 shadow-md">
                            ➕ Thêm Tour Mới Vào Hệ Thống
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTourPage;