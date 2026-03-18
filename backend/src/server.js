require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import file cấu hình DB để kích hoạt hàm testConnection
const connectDB = require('./config/db.config');
connectDB(); // Kích hoạt kết nối đến MongoDB
const authRoutes = require('./modules/auth/auth.route');
const tourRoutes = require('./modules/tours/tour.route');

const app = express();

// --- 1. MIDDLEWARE ---
// Cho phép Frontend (React) gọi API mà không bị chặn bởi lỗi bảo mật CORS
app.use(cors()); 
// Giúp server đọc được dữ liệu JSON do Frontend gửi lên
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 2. ROUTES CƠ BẢN ---
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
// API kiểm tra sức khỏe của Server
app.get('/', (req, res) => {
    res.json({ 
        status: 'success',
        message: '🚀 Chào mừng đến với API Hệ thống Quản lý Du lịch!' 
    });
});

// --- 3. KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 Server Backend đang chạy tại cổng ${PORT}`);
    console.log(`🔗 Link truy cập: http://localhost:${PORT}`);
    console.log(`=========================================\n`);
});