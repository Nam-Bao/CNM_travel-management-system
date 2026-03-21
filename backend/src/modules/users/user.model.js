const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        full_name: {
            type: String,
            required: [true, 'Vui lòng nhập họ tên'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Vui lòng nhập email'],
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, 'Vui lòng nhập mật khẩu'],
            minlength: 6
        },
        phone: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer'
        },
        status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active'
        }
    },
    { 
        timestamps: true // Tự động thêm createdAt và updatedAt
    }
);

module.exports = mongoose.model('User', userSchema);