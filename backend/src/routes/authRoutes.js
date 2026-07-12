const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); // Import middleware
const { validateRegister, validateLogin } = require("../middleware/validators");

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe); // Protected route to check live sessions
router.patch("/password", protect, changePassword); // Change password (authenticated)

module.exports = router;
