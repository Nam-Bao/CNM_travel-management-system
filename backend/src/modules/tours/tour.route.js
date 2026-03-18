const express = require('express');
const router = express.Router();
const tourController = require('./tour.controller');
const { verifyToken, verifyAdmin } = require('../../middlewares/auth.middleware');
const uploadCloud = require('../../config/cloudinary.config');

// Các API ai cũng có thể truy cập (Khách hàng xem tour)
router.get('/', tourController.getAllTours);
router.get('/slug/:slug', tourController.getTourBySlug);
router.get('/:id', tourController.getTourById);

// Điều này báo cho Backend biết: Hãy đón một file có tên là 'image', up lên Cloud đi rồi mới chạy vào Controller
router.post('/', verifyToken, uploadCloud.single('image'), tourController.createTour);

// Các API bắt buộc phải là Admin mới được thao tác
// Chú ý: Ta gắn verifyAdmin vào giữa để nó kiểm tra trước khi chạy vào Controller
router.post('/', verifyToken, tourController.createTour);
router.put('/:id', verifyToken, uploadCloud.single('image'), tourController.updateTour);
router.delete('/:id', verifyToken, tourController.deleteTour);

module.exports = router;