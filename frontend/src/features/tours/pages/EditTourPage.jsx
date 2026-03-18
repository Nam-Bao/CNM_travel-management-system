import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tourApi from '../api/tourApi';

const EditTourPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    
    const [formData, setFormData] = useState({
        title: '', description: '', price: '', duration: '',
        image_url: '', max_seats: '', available_seats: '', start_date: ''
    });
    const [imageFile, setImageFile] = useState(null); // State chứa file mới (nếu có)
    const [loadingData, setLoadingData] = useState(true); // Loading khi kéo dữ liệu
    const [saving, setSaving] = useState(false); // Loading khi bấm nút Lưu
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchTourDetails = async () => {
            try {
                const response = await tourApi.getTourById(id);
                const tour = response.data;
                setFormData({
                    ...tour,
                    start_date: tour.start_date ? tour.start_date.split('T')[0] : ''
                });
            } catch (error) {
                setMessage('❌ Không thể tải thông tin tour này.');
            } finally {
                setLoadingData(false);
            }
        };
        fetchTourDetails();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('⏳ Đang lưu thay đổi. Vui lòng đợi...');
        setSaving(true);

        try {
            // Đóng gói bằng FormData giống hệt AddTour
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Nếu người dùng chọn ảnh MỚI, gắn nó vào gói hàng
            if (imageFile) {
                data.append('image', imageFile);
            }

            await tourApi.updateTour(id, data);
            
            alert('✅ Cập nhật tour thành công!');
            navigate('/admin/tours'); 
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
            setSaving(false);
        }
    };

    if (loadingData) return <div className="text-center p-10 font-bold text-gray-500">Đang tải dữ liệu...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border-t-4 border-yellow-500">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                    ✏️ Cập Nhật Thông Tin Tour
                </h2>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg font-medium ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Tour *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required disabled={saving}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá tiền (VNĐ) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required disabled={saving}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian *</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} required disabled={saving}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả Tour *</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" disabled={saving}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none"></textarea>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số vé *</label>
                                <input type="number" name="max_seats" value={formData.max_seats} onChange={handleChange} required disabled={saving}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vé còn trống *</label>
                                <input type="number" name="available_seats" value={formData.available_seats} onChange={handleChange} required disabled={saving}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày khởi hành *</label>
                            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required disabled={saving}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" />
                        </div>
                        
                        {/* KHU VỰC THÊM ẢNH (Có hiển thị trước ảnh cũ) */}
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <label className="block text-sm font-bold text-gray-700 mb-2">📸 Hình ảnh (Tùy chọn)</label>
                            
                            {/* Hiển thị ảnh cũ để Admin biết */}
                            {formData.image_url && !imageFile && (
                                <div className="mb-3">
                                    <span className="text-xs text-gray-500 mb-1 block">Ảnh hiện tại:</span>
                                    <img src={formData.image_url} alt="Current tour" className="h-20 w-auto rounded border shadow-sm object-cover" />
                                </div>
                            )}

                            <div className="mb-3 mt-2">
                                <span className="text-xs text-gray-500 mb-1 block">Đổi ảnh mới (Tải từ máy tính):</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} disabled={saving}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 cursor-pointer" />
                            </div>
                            
                            <div className="text-center text-gray-400 text-xs font-bold my-2">HOẶC</div>

                            <div>
                                <span className="text-xs text-gray-500 mb-1 block">Đổi bằng Link URL:</span>
                                <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} disabled={saving || imageFile !== null}
                                    className={`w-full px-4 py-2 border rounded-md outline-none text-sm ${imageFile ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-2 focus:ring-yellow-500'}`} />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 mt-4 flex gap-4">
                        <button type="submit" disabled={saving} className={`flex-1 font-bold py-3 rounded-md transition duration-300 shadow-md ${saving ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}>
                            {saving ? '⏳ Đang lưu...' : '💾 Lưu Thay Đổi'}
                        </button>
                        <button type="button" onClick={() => navigate('/admin/tours')} disabled={saving} className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-md hover:bg-gray-400 transition duration-300 shadow-md">
                            ❌ Hủy bỏ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTourPage;