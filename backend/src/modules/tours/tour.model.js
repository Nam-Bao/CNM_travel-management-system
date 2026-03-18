const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Vui lòng nhập tên tour'],
            trim: true
        },
        slug: { 
            type: String, 
            unique: true 
        },
        description: {
            type: String,
            required: [true, 'Vui lòng nhập mô tả tour']
        },
        price: {
            type: Number,
            required: [true, 'Vui lòng nhập giá tour']
        },
        duration: {
            type: String,
            required: true // VD: "3 ngày 2 đêm"
        },
        image_url: {
            type: String,
            default: 'default-tour.jpg' // Ảnh mặc định nếu không up ảnh
        },
        max_seats: {
            type: Number,
            required: true
        },
        available_seats: {
            type: Number,
            required: true
        },
        start_date: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

// Hàm chuyển Tiếng Việt có dấu thành không dấu (Slugify)
const generateSlug = (str) => {
    return str.toLowerCase()
        .normalize('NFD') // Chuyển đổi Unicode
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
        .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Đổi chữ đ
        .replace(/[^a-z0-9 ]/g, '') // Xóa ký tự đặc biệt
        .replace(/\s+/g, '-'); // Thay khoảng trắng bằng dấu gạch ngang
};

// Middleware: Tự động chạy trước khi lưu (save) vào Database
tourSchema.pre('save', function() {
    if (this.isModified('title')) {
        // Nối thêm 1 đoạn mã ngẫu nhiên nhỏ để tránh trùng lặp 100% nếu 2 tour trùng tên
        const randomString = Math.random().toString(36).substring(2, 6);
        this.slug = `${generateSlug(this.title)}-${randomString}`;
    }

});

module.exports = mongoose.model('Tour', tourSchema);