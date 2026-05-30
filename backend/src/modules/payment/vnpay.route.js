const express = require('express');
const router = express.Router();
const vnpayController = require('./vnpay.controller'); // Dẫn đúng vào file controller cùng thư mục
const vietqrController = require('./vietqr.controller'); 

// API: POST /api/payment/vnpay/create_payment_url
router.post('/vnpay/create_payment_url', vnpayController.createPaymentUrl);
router.post('/sepay-webhook', vietqrController.verifySePayWebhook);
router.get('/vnpay_return', vnpayController.vnpayReturn);

module.exports = router;