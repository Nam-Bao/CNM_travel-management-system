const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Vui lòng nhập tên tour'],
            trim: true
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

module.exports = mongoose.model('Tour', tourSchema);