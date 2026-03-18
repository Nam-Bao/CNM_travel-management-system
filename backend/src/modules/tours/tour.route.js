const express = require('express');
const router = express.Router();
const tourController = require('./tour.controller');
const { verifyToken, verifyAdmin } = require('../../middlewares/auth.middleware');

// Các API ai cũng có thể truy cập (Khách hàng xem tour)
router.get('/', tourController.getAllTours);
router.get('/slug/:slug', tourController.getTourBySlug);
router.get('/:id', tourController.getTourById);

// Các API bắt buộc phải là Admin mới được thao tác
// Chú ý: Ta gắn verifyAdmin vào giữa để nó kiểm tra trước khi chạy vào Controller
router.post('/', verifyToken, tourController.createTour);
router.put('/:id', verifyToken, tourController.updateTour);
router.delete('/:id', verifyToken, tourController.deleteTour);

module.exports = router;