const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },

  guest_size: {
    adult: { type: Number, required: true, min: 1 },
    child: { type: Number, default: 0 },
    infant: { type: Number, default: 0 },
  },

  // ✅ Lưu danh sách mã giường/ghế khách đã chọn
  selected_seats: [{ type: String }],
  selected_beds: [{ type: String }],

  // ✅ Thông tin giường đôi (tính phí thêm)
  couple_beds: [{ type: String }],
  couple_price: { type: Number, default: 0 },

  // ✅ Thông tin khách sạn khách đặt thêm
  hotel_addon: {
    hotel_id: { type: String, default: null },
    hotel_name: { type: String, default: null },
    price_per_night: { type: Number, default: 0 },
  },

  total_price: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "SUCCESS", "CANCELED"],
    default: "pending",
  },

  contact_info: {
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },

  refund_percentage: { type: Number, default: 0 },
  refund_amount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
