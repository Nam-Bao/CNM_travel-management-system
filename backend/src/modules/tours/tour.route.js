const express = require('express');
const router = express.Router();
const tourController = require('./tour.controller');
const { verifyToken, verifyAdmin } = require('../../middlewares/auth.middleware');
const uploadCloud = require('../../config/cloudinary.config');

// === 1. CÁC API CÔNG KHAI (Public - Ai cũng xem được) ===
router.get('/', tourController.getAllTours);
router.get('/slug/:slug', tourController.getTourBySlug);
router.get('/:id', tourController.getTourById);


// === 2. CÁC API BẢO MẬT CAO (Chỉ dành riêng cho Admin) ===

// [POST] /api/tours - Thêm Tour Mới (Nhiều ảnh, Nhiều giá)
// Stack bảo mật chuẩn: Kiểm tra Token ➡️ Kiểm tra quyền Admin ➡️ Đón ảnh up lên Cloud ➡️ Chạy vào Controller
router.post(
    '/', 
    verifyToken,     // 1. Phải đăng nhập
    verifyAdmin,     // 2. Phải là Admin mới được đi tiếp
    uploadCloud.array('images', 5), // 3. Hợp lệ rồi mới cho up tối đa 5 ảnh
    tourController.createTour       // 4. Xong xuôi mới lưu vào DB
);

// [PUT] /api/tours/:id - Cập nhật Tour (Nhiều ảnh, Nhiều giá)
router.put(
    '/:id', 
    verifyToken, 
    verifyAdmin, 
    uploadCloud.array('images', 5), 
    tourController.updateTour
);

// [DELETE] /api/tours/:id - Xóa Tour (Soft delete đã học ở phần trước)
router.delete('/:id', verifyToken, verifyAdmin, tourController.deleteTour);

module.exports = router;