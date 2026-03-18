import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tourApi from '../api/tourApi';

const EditTourPage = () => {
    const { id } = useParams(); // Lấy ID của tour từ URL (ví dụ: /admin/edit-tour/123)
    const navigate = useNavigate(); // Dùng để chuyển trang sau khi lưu thành công
    
    const [formData, setFormData] = useState({
        title: '', description: '', price: '', duration: '',
        image_url: '', max_seats: '', available_seats: '', start_date: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Chạy khi vừa mở trang: Lấy dữ liệu tour cũ đổ vào form
    useEffect(() => {
        const fetchTourDetails = async () => {
            try {
                const response = await tourApi.getTourById(id);
                const tour = response.data;
                // Cập nhật form với dữ liệu lấy được (format lại ngày tháng cho thẻ input type="date")
                setFormData({
                    ...tour,
                    start_date: tour.start_date ? tour.start_date.split('T')[0] : ''
                });
            } catch (error) {
                setMessage('❌ Không thể tải thông tin tour này.');
            } finally {
                setLoading(false);
            }
        };
        fetchTourDetails();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Đang lưu thay đổi...');
        try {
            await tourApi.updateTour(id, formData);
            alert('✅ Cập nhật tour thành công!');
            navigate('/admin/tours'); // Đá người dùng về lại trang danh sách
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
        }
    };

    if (loading) return <div className="text-center p-10 font-bold text-gray-500">Đang tải dữ liệu...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border-t-4 border-yellow-500">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                    ✏️ Cập Nhật Thông Tin Tour
                </h2>

                {message && (
                    <div className="mb-6 p-4 rounded-lg font-medium bg-red-100 text-red-700">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột trái */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Tour *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá tiền (VNĐ) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian *</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} required
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả Tour *</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none"></textarea>
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số vé *</label>
                                <input type="number" name="max_seats" value={formData.max_seats} onChange={handleChange} required
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vé còn trống *</label>
                                <input type="number" name="available_seats" value={formData.available_seats} onChange={handleChange} required
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày khởi hành *</label>
                            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link Ảnh (URL)</label>
                            <input type="text" name="image_url" value={formData.image_url} onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                        </div>
                    </div>

                    <div className="md:col-span-2 mt-4 flex gap-4">
                        <button type="submit" className="flex-1 bg-yellow-500 text-white font-bold py-3 rounded-md hover:bg-yellow-600 transition duration-300 shadow-md">
                            💾 Lưu Thay Đổi
                        </button>
                        <button type="button" onClick={() => navigate('/admin/tours')} className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-md hover:bg-gray-400 transition duration-300 shadow-md">
                            ❌ Hủy bỏ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTourPage;