const Tour = require('./tour.model');

// [POST] /api/tours - Thêm Tour mới (Chỉ Admin)
const createTour = async (req, res) => {
    try {
        // Copy toàn bộ dữ liệu (title, price,...) từ req.body ra một biến mới
        const tourData = { ...req.body };

        // Nếu Frontend gửi lên một File, Multer đã đẩy lên Cloud và để lại cái Link mới toanh ở req.file.path
        if (req.file) {
            tourData.image_url = req.file.path; // Lấy link Cloudinary đè vào
        } 
        // Nếu không có File (người dùng nhập bằng Link URL), req.file sẽ bị null.
        // Khi đó, hệ thống sẽ tự động dùng cái tourData.image_url đã có sẵn từ form nhập tay.

        const newTour = new Tour(tourData);
        const savedTour = await newTour.save();
        
        res.status(201).json({
            status: 'success',
            message: 'Tạo tour mới thành công!',
            data: savedTour
        });
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
// [PUT] /api/tours/:id - Cập nhật thông tin Tour
const updateTour = async (req, res) => {
    try {
        // 1. Lấy toàn bộ dữ liệu text gửi lên
        const updateData = { ...req.body };

        // 2. KẾT NỐI VỚI CLOUDINARY: Nếu có file ảnh mới gửi lên, lấy link gắn vào
        if (req.file) {
            updateData.image_url = req.file.path;
        }

        // 3. Tiến hành cập nhật vào Database bằng dữ liệu đã xử lý
        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, 
            { new: true, runValidators: true } 
        );

        if (!updatedTour) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy tour này!' });
        }
        res.status(200).json({ status: 'success', message: 'Cập nhật thành công!', data: updatedTour });
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