const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Liên kết với bảng User
            required: true
        },
        tour: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour', // Liên kết với bảng Tour
            required: true
        },
        num_guests: {
            type: Number,
            required: true,
            min: 1
        },
        total_price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'cancelled'],
            default: 'pending'
        },
        payment_method: {
            type: String,
            enum: ['cash', 'online'],
            default: 'cash'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);