const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");

router.post("/", auctionController.createAuction);
router.get("/", auctionController.getActiveAuctions);
router.get("/history", auctionController.getAuctionHistory);
router.get("/:id", auctionController.getAuctionById);
router.post("/:id/bids", auctionController.createBid);
router.get("/:id/bids", auctionController.getBidsForAuction);
router.get("/:id/highest-bid", auctionController.getHighestBid);
router.get("/user/:userId/bids", auctionController.getUserBids);
router.put("/:id/close", auctionController.closeAuction);

module.exports = router;
