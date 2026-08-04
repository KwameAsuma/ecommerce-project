const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(protect);

// Customer Routes
router.post("/", orderController.createOrder);
router.get("/customer", orderController.getCustomerOrders);
router.post("/:orderId/release-escrow", orderController.releaseEscrow);

// Vendor Routes
router.get("/vendor", orderController.getVendorOrders);
router.post("/:id/verify-delivery", orderController.verifyDeliveryAndReleaseEscrow);

// Shared/Status Update Route (Logic handles role checks)
router.patch("/:orderId/status", orderController.updateOrderStatus);

module.exports = router;
