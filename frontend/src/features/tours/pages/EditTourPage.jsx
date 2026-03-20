import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tourApi from '../api/tourApi';

const EditTourPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '', duration: '', start_date: '', end_date: '',
        max_seats: '', available_seats: '', description: '', sale_percentage: 0
    });
    const [price, setPrice] = useState({ adult: '', child: 0, infant: 0 });
    const [itinerary, setItinerary] = useState([{ day: 'Ngày 1', title: '', description: '' }]);
    
    // Ảnh cũ lấy từ DB
    const [existingImages, setExistingImages] = useState([]);
    
    // YÊU CẦU 3: State chứa File ảnh và Link URL ảnh
    const [imageFiles, setImageFiles] = useState([]);
    const [imageUrls, setImageUrls] = useState(''); // Nhập nhiều link cách nhau dấu phẩy
    
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // YÊU CẦU 1: State chứa thông báo lỗi Logic
    const [formError, setFormError] = useState('');

    // Kéo dữ liệu cũ về
    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await tourApi.getTourById(id);
                const tour = response.data;
                
                // THÊM || '' (Hoặc chuỗi rỗng) VÀO TẤT CẢ CÁC TRƯỜNG ĐỂ CHỐNG LỖI NULL CỦA REACT
                setFormData({
                    title: tour.title || '', 
                    duration: tour.duration || '',
                    start_date: tour.start_date ? tour.start_date.split('T')[0] : '',
                    end_date: tour.end_date ? tour.end_date.split('T')[0] : '',
                    max_seats: tour.max_seats || '', 
                    available_seats: tour.available_seats || '',
                    description: tour.description || '', 
                    sale_percentage: tour.sale_percentage || 0
                });
                
                // Dùng optional chaining (?.) để tránh lỗi nếu tour.price bị undefiend
                setPrice({ 
                    adult: tour.price?.adult || '', 
                    child: tour.price?.child || 0, 
                    infant: tour.price?.infant || 0 
                });
                
                setItinerary(tour.itinerary && tour.itinerary.length > 0 ? tour.itinerary : [{ day: 'Ngày 1', title: '', description: '' }]);
                setExistingImages(tour.images || []);
            } catch (error) {
                setFormError('❌ Không thể tải thông tin tour!');
            } finally {
                setLoadingData(false);
            }
        };
        fetchTour();
    }, [id]);

    const handleBasicChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePriceChange = (e) => setPrice({ ...price, [e.target.name]: e.target.value });
    
    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...itinerary];
        newItinerary[index][field] = value;
        setItinerary(newItinerary);
    };
    const addItineraryDay = () => setItinerary([...itinerary, { day: `Ngày ${itinerary.length + 1}`, title: '', description: '' }]);
    const removeItineraryDay = (indexToRemove) => {
        if (itinerary.length === 1) return alert('Phải có ít nhất 1 ngày lịch trình!');
        setItinerary(itinerary.filter((_, i) => i !== indexToRemove).map((item, i) => ({ ...item, day: `Ngày ${i + 1}` })));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) { alert('Tối đa 5 hình ảnh!'); e.target.value = null; return; }
        setImageFiles(files);
    };

    // --- BỘ KIỂM TRA LOGIC THÉP ---
    const validateLogic = () => {
        setFormError(''); // Reset lỗi
        
        // YÊU CẦU 2: Check giá Em bé < Trẻ em < Người lớn
        const pAdult = Number(price.adult);
        const pChild = Number(price.child);
        const pInfant = Number(price.infant);

        if (pChild > 0 && pInfant >= pChild) {
            setFormError('❌ LỖI LOGIC: Giá Em bé phải RẺ HƠN giá Trẻ em!'); return false;
        }
        if (pChild > 0 && pChild >= pAdult) {
            setFormError('❌ LỖI LOGIC: Giá Trẻ em phải RẺ HƠN giá Người lớn!'); return false;
        }

        // YÊU CẦU 4: Check vé trống <= Tổng vé
        if (Number(formData.available_seats) > Number(formData.max_seats)) {
            setFormError('❌ LỖI LOGIC: Số vé còn trống không thể lớn hơn Tổng số vé!'); return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Chạy kiểm tra logic trước khi gọi API
        if (!validateLogic()) {
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu để xem lỗi
            return; 
        }

        setFormError('⏳ Đang lưu thay đổi...');
        setSaving(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            data.append('price', JSON.stringify(price));
            data.append('itinerary', JSON.stringify(itinerary));

            // Xử lý ảnh: Gửi file tải lên
            if (imageFiles.length > 0) {
                imageFiles.forEach(file => data.append('images', file));
            }
            // YÊU CẦU 3: Xử lý ảnh URL (Cắt chuỗi bằng dấu phẩy và gửi từng link)
            if (imageUrls.trim()) {
                const urls = imageUrls.split(',').map(url => url.trim()).filter(url => url !== '');
                urls.forEach(url => data.append('images', url)); // Backend tự nhận diện chuỗi
            }

            await tourApi.updateTour(id, data);
            alert('✅ Cập nhật Tour thành công!');
            navigate('/admin/tours');
            
        } catch (error) {
            setFormError(`❌ Lỗi hệ thống: ${error.response?.data?.message || error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loadingData) return <div className="text-center p-10 font-bold">Đang tải dữ liệu...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-6 border-t-4 border-yellow-500">
                <h2 className="text-3xl font-black text-gray-800 mb-6 border-b pb-4">✏️ Cập Nhật Tour</h2>

                {/* YÊU CẦU 1: HIỂN THỊ LỖI RÕ RÀNG */}
                {formError && (
                    <div className={`mb-6 p-4 rounded-lg font-bold border ${formError.includes('✅') ? 'bg-green-100 text-green-700 border-green-300' : formError.includes('⏳') ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-red-50 text-red-700 border-red-300 animate-pulse'}`}>
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* KHU VỰC 1: THÔNG TIN CHUNG */}
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                        <h3 className="text-xl font-bold text-yellow-800 mb-4">📌 Thông tin chung</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tên Tour *</label>
                                <input type="text" name="title" value={formData.title} onChange={handleBasicChange} required disabled={saving} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Thời lượng *</label>
                                <input type="text" name="duration" value={formData.duration} onChange={handleBasicChange} required disabled={saving} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">% Khuyến mãi</label>
                                <input type="number" min="0" max="100" name="sale_percentage" value={formData.sale_percentage} onChange={handleBasicChange} required disabled={saving} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ngày đi *</label>
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleBasicChange} required disabled={saving} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ngày về *</label>
                                <input type="date" name="end_date" value={formData.end_date} onChange={handleBasicChange} required disabled={saving} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 text-red-600">Tổng số vé *</label>
                                <input type="number" name="max_seats" value={formData.max_seats} onChange={handleBasicChange} required disabled={saving} className="w-full px-4 py-2 border border-red-300 rounded focus:ring-2 focus:ring-yellow-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 text-red-600">Ghế trống hiện tại *</label>
                                <input type="number" name="available_seats" value={formData.available_seats} onChange={handleBasicChange} required disabled={saving} className="w-full px-4 py-2 border border-red-300 rounded focus:ring-2 focus:ring-yellow-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả tổng quan *</label>
                                <textarea name="description" value={formData.description} onChange={handleBasicChange} required rows="3" disabled={saving} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* KHU VỰC 2: BẢNG GIÁ */}
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="text-xl font-bold text-green-800 mb-4">💰 Bảng giá (VNĐ)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-green-700 mb-1">Người lớn *</label>
                                <input type="number" name="adult" value={price.adult} onChange={handlePriceChange} required disabled={saving} className="w-full px-4 py-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500 font-bold" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-green-700 mb-1">Trẻ em (2-12 tuổi)</label>
                                <input type="number" name="child" value={price.child} onChange={handlePriceChange} disabled={saving} className="w-full px-4 py-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-green-700 mb-1">Em bé (&lt; 2 tuổi)</label>
                                <input type="number" name="infant" value={price.infant} onChange={handlePriceChange} disabled={saving} className="w-full px-4 py-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500" />
                            </div>
                        </div>
                    </div>

                    {/* KHU VỰC LỘ TRÌNH (Tương tự AddTour) */}
                    <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-orange-800">🗺️ Lịch trình</h3>
                            <button type="button" onClick={addItineraryDay} className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold">+ Thêm ngày</button>
                        </div>
                        <div className="space-y-4">
                            {itinerary.map((item, index) => (
                                <div key={index} className="bg-white p-4 border rounded-lg relative">
                                    <div className="absolute top-2 right-2 text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded text-xs">{item.day}</div>
                                    <div className="pr-16 space-y-2">
                                        <input type="text" placeholder="Tiêu đề ngày..." value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} required className="w-full px-3 py-1.5 border rounded text-sm" />
                                        <textarea placeholder="Mô tả..." value={item.description} onChange={(e) => handleItineraryChange(index, 'description', e.target.value)} required rows="2" className="w-full px-3 py-1.5 border rounded text-sm"></textarea>
                                    </div>
                                    {itinerary.length > 1 && <button type="button" onClick={() => removeItineraryDay(index)} className="mt-2 text-red-500 text-xs font-bold">🗑️ Xóa</button>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KHU VỰC ẢNH VÀ LINK URL */}
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <h3 className="text-xl font-bold text-purple-800 mb-4">📸 Hình ảnh</h3>
                        
                        {/* Ảnh cũ */}
                        {existingImages.length > 0 && (
                            <div className="mb-4 p-4 bg-white rounded border">
                                <p className="text-sm font-bold text-gray-600 mb-2">Ảnh hiện tại:</p>
                                <div className="flex gap-2 overflow-x-auto">
                                    {existingImages.map((img, i) => <img key={i} src={img} alt="" className="h-16 w-24 object-cover rounded shadow-sm border" />)}
                                </div>
                                <p className="text-xs text-red-500 mt-2 italic">* Nếu tải ảnh mới hoặc nhập Link, ảnh cũ sẽ bị xóa.</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Cách 1: Tải từ máy tính (Tối đa 5 ảnh)</label>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} disabled={saving || imageUrls.length > 0} className="w-full bg-white border p-2 rounded text-sm disabled:opacity-50" />
                            </div>
                            
                            <div className="text-center font-black text-gray-400">HOẶC</div>
                            
                            {/* YÊU CẦU 3: NHẬP LINK URL */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Cách 2: Nhập Link URL ảnh (Ngăn cách bằng dấu phẩy)</label>
                                <textarea 
                                    rows="2" 
                                    placeholder="https://anh1.jpg, https://anh2.jpg" 
                                    value={imageUrls} 
                                    onChange={(e) => setImageUrls(e.target.value)} 
                                    disabled={saving || imageFiles.length > 0} 
                                    className="w-full px-4 py-2 bg-white border rounded text-sm focus:ring-2 focus:ring-purple-500 disabled:opacity-50" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" disabled={saving} className="flex-1 py-4 rounded-xl text-lg font-black text-white bg-yellow-500 hover:bg-yellow-600 shadow-lg">
                            {saving ? '⏳ Đang lưu...' : '💾 LƯU THAY ĐỔI'}
                        </button>
                        <button type="button" onClick={() => navigate('/admin/tours')} className="flex-1 py-4 rounded-xl text-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300">
                            ❌ HỦY
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTourPage;