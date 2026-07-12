const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Submit a review (requires auth)
router.post("/", protect, reviewController.submitReview);

// Get reviews for a merchant (public)
router.get("/merchant/:merchantId", reviewController.getMerchantReviews);

// Get reviews for a product (public)
router.get("/product/:productId", reviewController.getProductReviews);

module.exports = router;
