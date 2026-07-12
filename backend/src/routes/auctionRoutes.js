const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");
const { validateAuctionCreate, validateBidCreate, validateIdParam, validateUserIdParam } = require("../middleware/validators");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Place more specific routes before the `/:id` param to avoid accidental matches
router.post("/", protect, restrictTo('merchant'), validateAuctionCreate, auctionController.createAuction);
router.get("/vendor", protect, restrictTo('merchant'), auctionController.getVendorAuctions);
router.get("/", auctionController.getActiveAuctions);
router.get("/history", auctionController.getAuctionHistory);
router.get("/user/:userId/bids", validateUserIdParam, auctionController.getUserBids);
router.get("/:id", validateIdParam, auctionController.getAuctionById);
router.post("/:id/bids", protect, restrictTo('customer'), validateIdParam, validateBidCreate, auctionController.createBid);
router.get("/:id/bids", validateIdParam, auctionController.getBidsForAuction);
router.get("/:id/highest-bid", validateIdParam, auctionController.getHighestBid);
router.put("/:id/close", protect, restrictTo('merchant'), validateIdParam, auctionController.closeAuction);

module.exports = router;
