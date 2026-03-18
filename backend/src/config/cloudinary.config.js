const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Cấu hình đăng nhập vào Cloudinary của bạn
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Cấu hình kho lưu trữ (Storage)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travel_tours', // Tên thư mục sẽ tự tạo trên Cloudinary
    allowedFormats: ['jpeg', 'png', 'jpg', 'webp'], // Chỉ cho phép up ảnh
  }
});

// 3. Khởi tạo Multer với cấu hình trên
const uploadCloud = multer({ storage });

module.exports = uploadCloud;