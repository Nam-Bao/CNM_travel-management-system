const express = require("express");
const router = express.Router();

const reviewController = require("./review.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// tạo review
router.post("/", verifyToken, reviewController.createReview);

module.exports = router;
