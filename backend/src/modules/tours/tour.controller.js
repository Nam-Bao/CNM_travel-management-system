const Tour = require('./tour.model');

// [POST] /api/tours - Thêm Tour mới (Chỉ Admin)
const createTour = async (req, res) => {
    try {
        const tourData = { ...req.body };

        // 1. Dịch ngược chuỗi chữ thành Object / Array
        if (req.body.price) tourData.price = JSON.parse(req.body.price);
        if (req.body.itinerary) tourData.itinerary = JSON.parse(req.body.itinerary);

        // 2. Gom tất cả link ảnh mới tải lên vào mảng images
        tourData.images = []; 
        if (req.files && req.files.length > 0) {
            tourData.images = req.files.map(file => file.path); // Lấy link Cloudinary của từng ảnh
        } 
        else if (req.body.images) {
            tourData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        const newTour = new Tour(tourData);
        const savedTour = await newTour.save();
        
        res.status(201).json({ status: 'success', message: 'Thêm Tour thành công', data: savedTour });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

// [GET] /api/tours - Lấy danh sách tất cả Tour (Ai cũng xem được)
const getAllTours = async (req, res) => {
    try {
        // Có thể thêm logic tìm kiếm, phân trang ở đây sau
        const tours = await Tour.find().sort({ createdAt: -1 }); // Lấy tour mới nhất lên đầu
        
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: tours
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Lỗi khi lấy danh sách tour' });
    }
};

// [GET] /api/tours/:id - Lấy chi tiết 1 Tour
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy tour này!' });
        }
        res.status(200).json({ status: 'success', data: tour });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Lỗi server' });
    }
};

// [GET] /api/tours/slug/:slug - Lấy chi tiết 1 Tour bằng Slug
const getTourBySlug = async (req, res) => {
    try {
        const tour = await Tour.findOne({ slug: req.params.slug });
        if (!tour) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy tour này!' });
        }
        res.status(200).json({ status: 'success', data: tour });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Lỗi server' });
    }
};

// [PUT] /api/tours/:id - Cập nhật thông tin Tour (Chỉ Admin)
// [PUT] /api/tours/:id - Cập nhật Tour
const updateTour = async (req, res) => {
    try {
        const tourData = { ...req.body };

        // 1. CHỮA LỖI ĐỎ: Dịch ngược chuỗi chữ thành Object/Array
        if (req.body.price && typeof req.body.price === 'string') {
            tourData.price = JSON.parse(req.body.price);
        }
        if (req.body.itinerary && typeof req.body.itinerary === 'string') {
            tourData.itinerary = JSON.parse(req.body.itinerary);
        }

        // 2. Xử lý lưu ảnh (hỗ trợ cả File tải lên và Link URL)
        if (req.files && req.files.length > 0) {
            // Cách 1: Người dùng upload file mới từ máy tính
            tourData.images = req.files.map(file => file.path);
        } else if (req.body.images) {
            // Cách 2: Người dùng dán Link URL
            tourData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }
        // Lưu ý: Nếu Admin không tải ảnh mới, req.files rỗng và req.body.images rỗng
        // -> tourData.images sẽ không được tạo ra -> Backend sẽ giữ nguyên ảnh cũ trong DB.

        // 3. CHỮA LỖI VÀNG (Terminal): Sửa new: true thành returnDocument: 'after'
        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id,
            tourData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedTour) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy Tour!' });
        }

        res.status(200).json({ status: 'success', message: 'Cập nhật thành công', data: updatedTour });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};
// [DELETE] /api/tours/:id - Xóa Tour (Chỉ Admin)
const deleteTour = async (req, res) => {
    try {
        const deletedTour = await Tour.findByIdAndDelete(req.params.id);
        if (!deletedTour) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy tour này!' });
        }
        res.status(200).json({ status: 'success', message: 'Đã xóa tour thành công!' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Lỗi server' });
    }
};

module.exports = {
    createTour,
    getAllTours,
    getTourById,
    getTourBySlug,
    updateTour,
    deleteTour
};