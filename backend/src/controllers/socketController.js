const AuctionModel = require("../models/AuctionModel");

module.exports = (io) => {
  // Listen for new clients connecting to the real-time server
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected to WebSockets: ${socket.id}`);

    // 1. Join a specific auction room
    // This ensures a user only gets price updates for the auction they are looking at
    socket.on("join_auction", (auctionId) => {
      socket.join(`auction_${auctionId}`);
      console.log(`Client ${socket.id} joined auction room: ${auctionId}`);
    });

    // 2. Handle a live bid
    socket.on("place_bid", async (bidData) => {
      try {
        // bidData expects: { auctionId, userId, bidAmount }
        const newBid = await AuctionModel.createBid(bidData);

        // Broadcast the new bid ONLY to users in that specific auction room
        io.to(`auction_${bidData.auctionId}`).emit("new_bid", newBid);
        console.log(`💰 Live bid placed in auction ${bidData.auctionId} for GHS ${bidData.bidAmount}`);
        
      } catch (error) {
        console.error("Socket bid error:", error.message);
        // Send the error back only to the person who tried to place the bad bid
        socket.emit("bid_error", { error: "Failed to place bid. Verify amount and user." });
      }
    });

    // Handle user disconnecting (closing the browser)
    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });
};