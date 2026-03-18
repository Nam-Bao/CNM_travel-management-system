const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Định nghĩa các endpoint
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;