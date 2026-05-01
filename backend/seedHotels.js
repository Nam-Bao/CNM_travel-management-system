const mongoose = require("mongoose");
const Hotel = require("./src/modules/hotels/hotel.model");
require("dotenv").config();

const cities = [
    "PHÚ QUỐC", "HUẾ", "HÀ GIANG", "SAPA", "ĐÀ LẠT",
    "VỊNH HẠ LONG", "NHA TRANG", "NINH BÌNH", "ĐÀ NẴNG",
    "CẦN THƠ", "PHAN THIẾT", "CÔN ĐẢO",
];

const hotelNames = [
    "Resort & Spa",
    "Grand Hotel",
    "Eco Lodge",
    "Riverside Mansion",
    "Sunset Villa",
];

// Bộ mảng ID ảnh thật từ Unsplash
const hotelImgIds = [
    "1566073771259-6a8506099945", "1582719478250-c89cae4dc85b", "1540518614846-7eded433c457",
    "1520250497591-112f2f40a3f4", "1445013544686-896cfbd96655", "1571896349842-33c89424de2d",
    "1564501025358-a1d2f770659a", "1596394516093-501ba68a0ba6", "1512918728675-ed5a9ecdebfd",
    "1499793983690-e29da59ef1c2", "1618773928121-c32242e8c719", "1551882547-ff40c63fe5fa",
];

const roomImgIds = ["1631049307264", "1611892440504", "1590490360182", "1566665797739"];

const roomTemplates = [
    { name: "Phòng Standard", priceMultiplier: 1, capacity: 2, amenities: ["Wifi", "Tivi", "Ban công", "Máy chiếu"] },
    { name: "Phòng Deluxe Hướng Biển", priceMultiplier: 1.5, capacity: 2, amenities: ["Wifi", "Minibar", "Ban công", "Máy chiếu", "Hút thuốc"] },
    { name: "Phòng Suite Hoàng Gia", priceMultiplier: 3, capacity: 4, amenities: ["Ăn sáng", "Hồ bơi riêng", "Ban công", "Máy chiếu", "Hút thuốc"] },
];

const hotelData = [];

cities.forEach((city, cityIndex) => {
    // 🔥 THAY ĐỔI TẠI ĐÂY: Chỉnh i <= 3 để mỗi tỉnh chỉ có 3 khách sạn
    for (let i = 1; i <= 3; i++) {
        const basePrice = (Math.floor(Math.random() * 5) + 2) * 500000;
        const imgId = hotelImgIds[(cityIndex + i) % hotelImgIds.length];

        hotelData.push({
            id: `h-${cityIndex}-${i}`,
            name: `${city} ${hotelNames[i % hotelNames.length]} ${i}`,
            city: city,
            star: Math.floor(Math.random() * 2) + 4,
            price_per_night: basePrice,
            images: [
                `https://images.unsplash.com/photo-${imgId}?w=800&q=80`,
                `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80`,
                `https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80`,
            ],
            description: `Khu nghỉ dưỡng tuyệt vời tại ${city} với đầy đủ tiện ích chuẩn 5 sao.`,
            address: `${i * 15} Đường ven biển, ${city}`,
            amenities: ["Wifi", "Hồ bơi", "Spa"],
            room_types: roomTemplates.map((room, idx) => ({
                name: room.name,
                price_per_night: basePrice * room.priceMultiplier,
                capacity: room.capacity,
                amenities: room.amenities,
                image: `https://images.unsplash.com/photo-${roomImgIds[idx % roomImgIds.length]}?w=600&q=80`,
            })),
        });
    }
});

const seedDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/travel_db");
        await Hotel.deleteMany({});
        await Hotel.insertMany(hotelData);
        // Tính toán số lượng tỉnh thành * 3 khách sạn
        console.log(`✅ Đã nạp thành công ${hotelData.length} khách sạn vào Database!`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
seedDB();