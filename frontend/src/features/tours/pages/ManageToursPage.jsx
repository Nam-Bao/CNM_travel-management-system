import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import tourApi from '../api/tourApi';
import axios from 'axios'; // Import thêm axios để gọi API reviews

const ManageToursPage = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // States cho Tìm kiếm & Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // States cho Popup xem đánh giá
    const [selectedTourForReviews, setSelectedTourForReviews] = useState(null);
    const [tourReviews, setTourReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Hàm lấy danh sách Tour
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

    useEffect(() => {
        fetchTours();
    }, []);

    const handleDelete = async (id, title) => {
        if (window.confirm(`⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn tour "${title}" không?`)) {
            try {
                await tourApi.deleteTour(id);
                alert('✅ Đã xóa tour thành công!');
                setTours(tours.filter(tour => tour._id !== id));
            } catch (err) {
                alert(`❌ Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    // Hàm tính toán trạng thái Tour (Giống bên trang Booking)
    const getTourStatus = (tour) => {
        if (!tour || !tour.start_date) return "UNKNOWN";
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(tour.start_date);
        startDate.setHours(0, 0, 0, 0);

        const daysMatch = tour.duration ? tour.duration.match(/\d+/) : null;
        const days = daysMatch ? parseInt(daysMatch[0], 10) : 1;

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days - 1);
        endDate.setHours(0, 0, 0, 0);

        if (today < startDate) return "PENDING";
        if (today >= startDate && today <= endDate) return "ONGOING";
        return "COMPLETED";
    };

    // Mở Popup và tải danh sách đánh giá
    const handleOpenReviews = async (tour) => {
        setSelectedTourForReviews(tour);
        setLoadingReviews(true);
        try {
            // Gọi API lấy đánh giá của tour này
            const res = await axios.get(`http://localhost:5000/api/reviews/${tour._id}`);
            setTourReviews(res.data.data || []);
        } catch (err) {
            console.error("Lỗi tải đánh giá:", err);
            setTourReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    // LOGIC TÌM KIẾM & LỌC TRẠNG THÁI
    const filteredTours = tours.filter(tour => {
        const matchName = tour.title.toLowerCase().includes(searchTerm.toLowerCase());
        const status = getTourStatus(tour);
        const matchStatus = statusFilter === 'ALL' || status === statusFilter;
        return matchName && matchStatus;
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-md min-h-full relative">
            
            {/* COMPONENT: POPUP XEM ĐÁNH GIÁ CỦA TOUR */}
            {selectedTourForReviews && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-black text-xl text-gray-800">⭐ Đánh giá Khách hàng</h3>
                                <p className="text-sm text-blue-600 font-bold truncate max-w-md mt-1">{selectedTourForReviews.title}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedTourForReviews(null)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500 font-bold transition"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-grow bg-white">
                            {loadingReviews ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                                    <span className="font-bold text-gray-500">Đang tải đánh giá...</span>
                                </div>
                            ) : tourReviews.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="text-6xl grayscale opacity-30 block mb-4">🤐</span>
                                    <p className="text-gray-500 font-medium italic">Chưa có khách hàng nào đánh giá tour này.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tourReviews.map(rev => (
                                        <div key={rev._id} className="border-b border-dashed pb-4 last:border-0 bg-gray-50 p-4 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-sm text-gray-800">{rev.user?.full_name || rev.user?.username || "Khách hàng"}</p>
                                                <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded shadow-sm border">{new Date(rev.createdAt).toLocaleDateString("vi-VN")}</span>
                                            </div>
                                            <div className="text-yellow-400 text-xs mb-2">{"★".repeat(rev.rating)}<span className="text-gray-300">{"★".repeat(5 - rev.rating)}</span></div>
                                            <p className="text-sm text-gray-700 leading-relaxed">"{rev.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER PAGE */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">🗂️ Danh sách Tour</h2>
                <Link to="/admin/add-tour" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition shadow-md flex items-center gap-2">
                    <span>➕</span> Thêm Tour Mới
                </Link>
            </div>

            {/* THANH TÌM KIẾM & BỘ LỌC */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-3 text-gray-400">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tour theo tên..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white cursor-pointer font-medium text-gray-700"
                    >
                        <option value="ALL">📋 Tất cả Trạng thái</option>
                        <option value="PENDING">⏳ Chưa khởi hành</option>
                        <option value="ONGOING">🔥 Đang thực hiện</option>
                        <option value="COMPLETED">✅ Đã hoàn thành</option>
                    </select>
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
                    <p className="text-gray-500 font-medium">Không tìm thấy tour nào phù hợp với bộ lọc.</p>
                </div>
            )}

            {!loading && !error && filteredTours.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase tracking-wider">Tên Tour & Trạng thái</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase tracking-wider">Giá vé</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-blue-800 uppercase tracking-wider">Thời gian</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-blue-800 uppercase tracking-wider">Chỗ trống</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-blue-800 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredTours.map((tour) => {
                                const status = getTourStatus(tour);

                                return (
                                    <tr key={tour._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={tour.images && tour.images.length > 0 ? tour.images[0] : 'https://placehold.co/400x300?text=No+Image'} 
                                                    alt={tour.title} 
                                                    className={`h-14 w-20 object-cover rounded-lg shadow-sm border ${status === 'COMPLETED' ? 'grayscale opacity-70' : ''}`} 
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-800 line-clamp-2 max-w-sm mb-1">{tour.title}</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-500">{new Date(tour.start_date).toLocaleDateString('vi-VN')}</span>
                                                        
                                                        {/* Badge Trạng thái */}
                                                        {status === 'PENDING' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">Chưa đi</span>}
                                                        {status === 'ONGOING' && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold uppercase">Đang chạy</span>}
                                                        {status === 'COMPLETED' && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">Đã kết thúc</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-red-600">
                                            {tour.price?.adult !== undefined && tour.price?.adult !== null
                                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price.adult) 
                                                : 'Chưa cập nhật'}
                                        </td>
                                        
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 font-bold">
                                            {tour.duration}
                                        </td>
                                        
                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-black rounded-lg border ${tour.available_seats > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {tour.available_seats} / {tour.max_seats}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2 flex-wrap max-w-[150px] mx-auto">
                                                
                                                {/* 1. NÚT SỬA: Chỉ mở khi tour CHƯA KHỞI HÀNH (PENDING) */}
                                                {status === 'PENDING' ? (
                                                    <Link 
                                                        to={`/admin/edit-tour/${tour._id}`} 
                                                        className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition hover:bg-blue-600 hover:text-white border border-blue-200"
                                                    >
                                                        ✏️ Sửa
                                                    </Link>
                                                ) : (
                                                    <span 
                                                        title="Không thể sửa tour đã khởi hành"
                                                        className="text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 cursor-not-allowed opacity-60"
                                                    >
                                                        🔒 Sửa
                                                    </span>
                                                )}

                                                {/* 2. NÚT XÓA: Chỉ mở khi tour ĐÃ HOÀN THÀNH (COMPLETED) */}
                                                {status === 'COMPLETED' ? (
                                                    <button 
                                                        onClick={() => handleDelete(tour._id, tour.title)}
                                                        className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition hover:bg-red-600 hover:text-white border border-red-200"
                                                    >
                                                        🗑️ Xóa
                                                    </button>
                                                ) : (
                                                    <button 
                                                        disabled
                                                        title="Chỉ có thể xóa tour đã hoàn thành"
                                                        className="text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 cursor-not-allowed opacity-60"
                                                    >
                                                        🔒 Xóa
                                                    </button>
                                                )}

                                                {/* 3. NÚT ĐÁNH GIÁ: Chỉ mở khi tour ĐÃ HOÀN THÀNH */}
                                                {status === 'COMPLETED' && (
                                                    <button 
                                                        onClick={() => handleOpenReviews(tour)}
                                                        className="w-full mt-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg text-xs font-black transition hover:bg-yellow-400 hover:text-yellow-900 border border-yellow-300 shadow-sm"
                                                    >
                                                        ⭐ Đánh giá
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageToursPage;