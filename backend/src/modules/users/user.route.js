const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyToken, verifyAdmin } = require('../../middlewares/auth.middleware');

// Tuyệt đối bảo mật: Phải đăng nhập (verifyToken) VÀ là Admin (verifyAdmin)
router.get('/', verifyToken, verifyAdmin, userController.getAllUsers);

// [PUT] /api/users/:id/role - Cập nhật quyền (MỚI)
router.put('/:id/role', verifyToken, verifyAdmin, userController.updateUserRole);


router.put('/:id/status', verifyToken, verifyAdmin, userController.toggleUserStatus);

module.exports = router;