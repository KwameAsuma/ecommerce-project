const AuctionModel = require("../models/AuctionModel");
const prisma = require("../config/prisma");

module.exports = (io) => {
  // Listen for new clients connecting to the real-time server
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected to WebSockets: ${socket.id}`);

    // 1. Join a specific auction room and broadcast real viewer count
    socket.on("join_auction", (auctionId) => {
      socket.join(`auction_${auctionId}`);
      socket.currentAuctionId = auctionId;
      console.log(`Client ${socket.id} joined auction room: ${auctionId}`);

      const roomSize = io.sockets.adapter.rooms.get(`auction_${auctionId}`)?.size || 1;
      io.to(`auction_${auctionId}`).emit("update_watchers", roomSize);
    });

    socket.on("leave_auction", (auctionId) => {
      socket.leave(`auction_${auctionId}`);
      if (socket.currentAuctionId == auctionId) {
        socket.currentAuctionId = null;
      }
      const roomSize = io.sockets.adapter.rooms.get(`auction_${auctionId}`)?.size || 0;
      io.to(`auction_${auctionId}`).emit("update_watchers", roomSize);
    });

    // 2. Broadcast live bid without duplicate DB creation (already saved via REST API)
    socket.on("place_bid", (bidData) => {
      // Broadcast the new bid ONLY to users in that specific auction room
      io.to(`auction_${bidData.auctionId}`).emit("new_bid", bidData);
      console.log(`💰 Live bid broadcasted in auction ${bidData.auctionId} for GHS ${bidData.bidAmount}`);
    });

    // Handle user disconnecting (closing the browser)
    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
      if (socket.currentAuctionId) {
        const roomSize = io.sockets.adapter.rooms.get(`auction_${socket.currentAuctionId}`)?.size || 0;
        io.to(`auction_${socket.currentAuctionId}`).emit("update_watchers", roomSize);
      }
    });
  });
};