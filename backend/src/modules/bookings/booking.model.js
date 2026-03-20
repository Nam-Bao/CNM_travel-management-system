const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    
    // Đã thay đổi: Không dùng num_guests chung chung nữa, mà chia làm 3 loại
    guest_size: {
        adult: { type: Number, required: true, min: 1 }, // Bắt buộc phải có ít nhất 1 người lớn
        child: { type: Number, default: 0 },
        infant: { type: Number, default: 0 }
    },
    
    total_price: { type: Number, required: true }, // Tổng tiền sau khi đã nhân giá + trừ khuyến mãi
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    
    // Thêm thông tin liên hệ của người đặt (Rất quan trọng cho thực tế)
    contact_info: {
        full_name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);