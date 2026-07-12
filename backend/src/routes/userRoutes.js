const express = require("express");
const { getDashboard, getMerchants, getUserById, getMerchantProfile, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public route — no auth required
router.get("/merchants", getMerchants);
router.get("/merchant/:id", getMerchantProfile);

// Apply protect middleware so only authenticated users can access this route
router.patch("/profile", protect, updateProfile);
router.get("/dashboard", protect, getDashboard);
router.get("/:id", protect, getUserById);

module.exports = router;
