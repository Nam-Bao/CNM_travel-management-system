const express = require("express");
const router = express.Router();

const reviewController = require("./review.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// Lấy danh sách review của 1 tour (không cần đăng nhập)
router.get("/:tourId", reviewController.getTourReviews);

// Tạo review (cần đăng nhập)
router.post("/", verifyToken, reviewController.createReview);

module.exports = router;
