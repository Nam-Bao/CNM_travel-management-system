const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Vui lòng nhập tên tour"], trim: true },
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

    max_seats: { type: Number, required: true },
    available_seats: { type: Number, required: true },

    tour_type: { type: String, enum: ["domestic", "international"], default: "domestic" },
    vehicle_type: { type: String, enum: ["seat", "bed"], default: "seat" },
    couple_bed_price: { type: Number, default: 0 },

    beds: [{
        code: { type: String },
        type: { type: String, enum: ["single", "double"], default: "single" },
        isBooked: { type: Boolean, default: false },
    }],

    description: { type: String, required: true },

    itinerary: [{
        day: { type: String },
        title: { type: String },
        description: { type: String },
    }],

    images: [{ type: String }],
}, {
    timestamps: true,
});

const generateSlug = (str) => {
    return str.toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-");
};

// Hook chạy trước khi lưu (Chỉ dùng duy nhất hook này, không dùng post save)
tourSchema.pre("save", async function() {
    // 1. Xử lý Slug
    if (this.isModified("title")) {
        const randomString = Math.random().toString(36).substring(2, 6);
        this.slug = `${generateSlug(this.title)}-${randomString}`;
    }

    // 2. Tự động tạo giường/ghế chỉ cho tour TRONG NƯỚC
    if (this.isNew && this.tour_type === "domestic" && (!this.beds || this.beds.length === 0)) {
        const generatedBeds = [];

        if (this.vehicle_type === "bed") {
            // ✅ Xe giường nằm 24 giường (Tầng dưới A1-A12, Tầng trên B1-B12)
            for (let i = 1; i <= 12; i++) {
                generatedBeds.push({ code: `A${i}`, type: "single", isBooked: false });
            }
            for (let j = 1; j <= 12; j++) {
                generatedBeds.push({ code: `B${j}`, type: "single", isBooked: false });
            }
            this.max_seats = 24;
            this.available_seats = 24;
        } else {
            // ✅ Xe ghế ngồi 29 chỗ (A1 - A29)
            for (let i = 1; i <= 29; i++) {
                generatedBeds.push({ code: `A${i}`, type: "single", isBooked: false });
            }
            this.max_seats = 29;
            this.available_seats = 29;
        }
        this.beds = generatedBeds;
    }

    // XÓA BỎ HOÀN TOÀN DÒNG next() Ở ĐÂY ĐỂ CHẤM DỨT LỖI!
});

module.exports = mongoose.model("Tour", tourSchema);

module.exports = mongoose.model("Tour", tourSchema);