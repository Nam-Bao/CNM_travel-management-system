const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    star: { type: Number, default: 5 },
    price_per_night: { type: Number, required: true },
    images: [{ type: String }], // Mảng chứa các link ảnh
    description: { type: String },
    amenities: [{ type: String }],
    address: { type: String },
    // 3 loại phòng
    room_types: [
      {
        name: { type: String, required: true },
        price_per_night: { type: Number, required: true },
        capacity: { type: Number, default: 2 },
        amenities: [{ type: String }],
        image: { type: String },
      },
    ],
  },
  { timestamps: true },
);

// Ép dùng collection tên là 'hotels' trong MongoDB
module.exports = mongoose.model("Hotel", hotelSchema, "hotels");
