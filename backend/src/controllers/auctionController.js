const AuctionModel = require("../models/AuctionModel");

exports.createAuction = async (req, res) => {
  try {
    const auction = await AuctionModel.createAuction(req.body);
    res.status(201).json({ message: "Auction created successfully", auction });
  } catch (error) {
    console.error("Error creating auction:", error);
    res.status(500).json({ error: "Failed to create auction" });
  }
};

exports.getActiveAuctions = async (req, res) => {
  try {
    const auctions = await AuctionModel.getActiveAuctions();
    res.status(200).json({ status: "success", auctions });
  } catch (error) {
    console.error("Error fetching active auctions:", error);
    res.status(500).json({ error: "Failed to fetch active auctions" });
  }
};

exports.getAuctionHistory = async (req, res) => {
  try {
    const history = await AuctionModel.getAuctionHistory();
    res.status(200).json({ status: "success", history });
  } catch (error) {
    console.error("Error fetching auction history:", error);
    res.status(500).json({ error: "Failed to fetch auction history" });
  }
};

exports.getAuctionById = async (req, res) => {
  try {
    const auction = await AuctionModel.getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.status(200).json({ status: "success", auction });
  } catch (error) {
    console.error("Error fetching auction by ID:", error);
    res.status(500).json({ error: "Failed to fetch auction" });
  }
};

exports.createBid = async (req, res) => {
  try {
    // Combine URL parameter with request body data
    const bidData = {
      auctionId: req.params.id,
      userId: req.body.userId,
      bidAmount: req.body.bidAmount,
    };
    const bid = await AuctionModel.createBid(bidData);
    res.status(201).json({ message: "Bid placed successfully", bid });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Failed to place bid" });
  }
};

exports.getBidsForAuction = async (req, res) => {
  try {
    const bids = await AuctionModel.getBidsForAuction(req.params.id);
    res.status(200).json({ status: "success", bids });
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
};

exports.getHighestBid = async (req, res) => {
  try {
    const bid = await AuctionModel.getHighestBid(req.params.id);
    res.status(200).json({ status: "success", bid });
  } catch (error) {
    console.error("Error fetching highest bid:", error);
    res.status(500).json({ error: "Failed to fetch highest bid" });
  }
};

exports.getUserBids = async (req, res) => {
  try {
    const bids = await AuctionModel.getUserBids(req.params.userId);
    res.status(200).json({ status: "success", bids });
  } catch (error) {
    console.error("Error fetching user bids:", error);
    res.status(500).json({ error: "Failed to fetch user bids" });
  }
};

exports.closeAuction = async (req, res) => {
  try {
    const auction = await AuctionModel.closeAuction(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found to close" });
    }
    res.status(200).json({ message: "Auction closed successfully", auction });
  } catch (error) {
    console.error("Error closing auction:", error);
    res.status(500).json({ error: "Failed to close auction" });
  }
};
