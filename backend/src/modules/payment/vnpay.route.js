const express = require('express');
const router = express.Router();
const vnpayController = require('./vnpay.controller'); // Dẫn đúng vào file controller cùng thư mục

// API: POST /api/payment/vnpay/create_payment_url
router.post('/vnpay/create_payment_url', vnpayController.createPaymentUrl);

module.exports = router;