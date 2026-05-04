const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Vui lòng nhập tên tour"],
        trim: true,
    },
    slug: { type: String, unique: true },

    price: {
        adult: { type: Number, required: true },
        child: { type: Number, default: 0 },
        infant: { type: Number, default: 0 },
    },
    sale_percentage: { type: Number, default: 0, min: 0, max: 100 },

    duration: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },

    max_seats: { type: Number, required: true, default: 24 },
    available_seats: { type: Number, required: true },

    // ✅ Loại tour: "domestic" (trong nước) hoặc "international" (nước ngoài)
    tour_type: {
        type: String,
        enum: ["domestic", "international"],
        default: "domestic",
    },

    // ✅ Loại xe: "seat" (ghế ngồi) hoặc "bed" (giường nằm) - chỉ dùng cho domestic
    vehicle_type: {
        type: String,
        enum: ["seat", "bed"],
        default: "seat",
    },

    // ✅ Giá giường đôi (tính thêm nếu chọn) - chỉ dùng khi vehicle_type = "bed"
    couple_bed_price: { type: Number, default: 0 },

    // ✅ Quản lý giường nằm / ghế ngồi - chỉ dùng cho tour trong nước
    beds: [{
        code: { type: String },
        type: { type: String, enum: ["single", "double"] },
        isBooked: { type: Boolean, default: false },
    }, ],

    description: { type: String, required: true },

    itinerary: [{
        day: { type: String },
        title: { type: String },
        description: { type: String },
    }, ],

    images: [{ type: String }],
}, {
    timestamps: true,
}, );

const generateSlug = (str) => {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-");
};

// Middleware: Tự động tạo Slug và Khởi tạo giường/ghế
tourSchema.pre("save", function(next) {
    // 1. Xử lý Slug
    if (this.isModified("title")) {
        const randomString = Math.random().toString(36).substring(2, 6);
        this.slug = `${generateSlug(this.title)}-${randomString}`;
    }

    // 2. Tự động tạo giường/ghế chỉ cho tour TRONG NƯỚC
    if (
        this.isNew &&
        this.tour_type === "domestic" &&
        (!this.beds || this.beds.length === 0)
    ) {
        const generatedBeds = [];

        if (this.vehicle_type === "bed") {
            // ✅ Xe giường nằm 24 giường (6 dãy x 4 giường)
            // Dãy 1-3: 2 giường đôi mỗi dãy (D1a, D1b, D2a, D2b, D3a, D3b)
            for (let row = 1; row <= 3; row++) {
                generatedBeds.push({
                    code: `D${row}a`,
                    type: "double",
                    isBooked: false,
                });
                generatedBeds.push({
                    code: `D${row}b`,
                    type: "double",
                    isBooked: false,
                });
            }
            // Dãy 4-6: 2 giường đơn mỗi dãy (S1, S2, S3, S4)
            for (let single = 1; single <= 4; single++) {
                generatedBeds.push({
                    code: `S${single}`,
                    type: "single",
                    isBooked: false,
                });
            }
        } else {
            // ✅ Xe ghế ngồi 29 chỗ
            for (let i = 1; i <= 29; i++) {
                generatedBeds.push({
                    code: `A${i}`,
                    type: "single",
                    isBooked: false,
                });
            }
        }
        this.beds = generatedBeds;
    }

    next();
});

module.exports = mongoose.model("Tour", tourSchema);