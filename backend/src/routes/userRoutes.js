const express = require("express");
const { getDashboard } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply protect middleware so only authenticated users can access this route
router.get("/dashboard", protect, getDashboard);

module.exports = router;
