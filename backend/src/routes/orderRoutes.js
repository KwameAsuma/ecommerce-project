const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(protect);

// Customer Routes
router.post("/", orderController.createOrder);
router.get("/customer", orderController.getCustomerOrders);

// Vendor Routes
router.get("/vendor", orderController.getVendorOrders);

// Shared/Status Update Route (Logic handles role checks)
router.patch("/:orderId/status", orderController.updateOrderStatus);

module.exports = router;
