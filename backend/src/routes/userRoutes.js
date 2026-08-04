const express = require("express");
const { getDashboard, getMerchants, getUserById, getMerchantProfile, updateProfile, deleteAccount } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public route — no auth required
router.get("/merchants", getMerchants);
router.get("/merchant/:id", getMerchantProfile);

router.patch("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteAccount);
router.get("/dashboard", protect, getDashboard);
router.get("/:id", protect, getUserById);

module.exports = router;
