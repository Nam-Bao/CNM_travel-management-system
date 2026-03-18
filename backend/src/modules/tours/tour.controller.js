const Tour = require('./tour.model');

// [POST] /api/tours - Thêm Tour mới (Chỉ Admin)
const createTour = async (req, res) => {
    try {
        const newTour = new Tour(req.body);
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

// [PUT] /api/tours/:id - Cập nhật thông tin Tour (Chỉ Admin)
const updateTour = async (req, res) => {
    try {
        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true } // Trả về data mới và chạy lại kiểm tra dữ liệu
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
    updateTour,
    deleteTour
};