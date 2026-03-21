import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import tourApi from '../api/tourApi';

const ManageToursPage = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Hàm lấy danh sách Tour từ Backend
    const fetchTours = async () => {
        try {
            const response = await tourApi.getAllTours();
            setTours(response.data);
        } catch (err) {
            setError('Không thể tải danh sách tour.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Chạy 1 lần khi mở trang
    useEffect(() => {
        fetchTours();
    }, []);

    // Hàm xử lý khi bấm nút Xóa
    const handleDelete = async (id, title) => {
        if (window.confirm(`⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn tour "${title}" không?`)) {
            try {
                await tourApi.deleteTour(id);
                alert('✅ Đã xóa tour thành công!');
                // Cập nhật lại giao diện: Lọc bỏ tour vừa xóa khỏi danh sách hiện tại
                setTours(tours.filter(tour => tour._id !== id));
            } catch (err) {
                alert(`❌ Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    // Lọc danh sách tour theo từ khóa tìm kiếm
    const filteredTours = tours.filter(tour => 
        tour.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-md min-h-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">🗂️ Danh sách Tour</h2>
                <Link to="/admin/add-tour" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm">
                    ➕ Thêm Tour Mới
                </Link>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tour theo tên..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {loading && <p className="text-center text-gray-500 py-10 font-medium">Đang tải dữ liệu...</p>}
            {error && <p className="text-center text-red-500 py-10 font-medium">{error}</p>}

            {!loading && !error && tours.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">Chưa có tour nào trong hệ thống.</p>
                </div>
            )}

            {!loading && !error && tours.length > 0 && filteredTours.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">Không tìm thấy tour nào phù hợp với từ khóa "{searchTerm}".</p>
                </div>
            )}

            {!loading && !error && filteredTours.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên Tour</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Giá vé</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thời gian</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Chỗ trống</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* FIX 1: Đã đổi thành filteredTours.map để chức năng tìm kiếm hoạt động */}
                            {filteredTours.map((tour) => (
                                <tr key={tour._id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={tour.images && tour.images.length > 0 ? tour.images[0] : 'https://placehold.co/400x300?text=No+Image'} 
                                                alt={tour.title} 
                                                className="h-12 w-16 object-cover rounded shadow-sm border" 
                                            />
                                            <div>
                                                <div className="font-bold text-gray-800 line-clamp-1">{tour.title}</div>
                                                <div className="text-xs text-gray-500">{new Date(tour.start_date).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* FIX 2: Sửa "Hạt sạn" giá tiền (Xử lý trường hợp giá bằng 0) */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                        {tour.price?.adult !== undefined && tour.price?.adult !== null
                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price.adult) 
                                            : 'Chưa cập nhật'}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                        {tour.duration}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${tour.available_seats > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {tour.available_seats} / {tour.max_seats}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <Link 
                                            to={`/admin/edit-tour/${tour._id}`} 
                                            className="text-blue-600 hover:text-blue-900 mx-2 bg-blue-50 px-3 py-1 rounded transition hover:bg-blue-100 inline-block"
                                        >
                                            ✏️ Sửa
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(tour._id, tour.title)}
                                            className="text-red-600 hover:text-red-900 mx-2 bg-red-50 px-3 py-1 rounded transition hover:bg-red-100"
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageToursPage;