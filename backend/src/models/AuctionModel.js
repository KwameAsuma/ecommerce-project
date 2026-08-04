const prisma = require("../config/prisma");

/**
 * AuctionModel - Prisma-based implementations for auctions and bids
 */

// CREATE AUCTION
exports.createAuction = async (auctionData) => {
  const { importerId, title, basePrice, endTime, imageUrl, brand, description, condition } = auctionData;
  try {
    const auction = await prisma.auction.create({
      data: {
        importerId: importerId,
        title,
        basePrice: basePrice?.toString?.() ?? String(basePrice),
        currentHighestBid: "0",
        status: "active",
        endTime: new Date(endTime),
        imageUrl: imageUrl ?? null,
        brand: brand ?? null,
        description: description ?? null,
        condition: condition ?? null,
      },
    });
    return auction;
  } catch (error) {
    throw new Error(`Error creating auction: ${error.message}`);
  }
};

// GET ACTIVE AUCTIONS
exports.getActiveAuctions = async () => {
  try {
    const auctions = await prisma.auction.findMany({
      where: {
        status: "active",
        endTime: { gt: new Date() },
      },
      orderBy: { endTime: "asc" },
      include: {
        bids: {
          orderBy: [{ bidAmount: "desc" }, { timestamp: "desc" }],
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        importer: { select: { id: true, name: true, email: true } }
      }
    });
    return auctions;
  } catch (error) {
    throw new Error(`Error fetching active auctions: ${error.message}`);
  }
};

// GET AUCTION BY ID
exports.getAuctionById = async (auctionId) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: Number(auctionId) },
      include: {
        bids: {
          orderBy: [{ bidAmount: "desc" }, { timestamp: "desc" }],
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        importer: { select: { id: true, name: true, email: true } }
      }
    });
    return auction;
  } catch (error) {
    throw new Error(`Error fetching auction: ${error.message}`);
  }
};

// CREATE BID
exports.createBid = async (bidData) => {
  const { auctionId, userId, bidAmount } = bidData;
  try {
    const bid = await prisma.bid.create({
      data: {
        auctionId: Number(auctionId),
        userId: Number(userId),
        bidAmount: bidAmount?.toString?.() ?? String(bidAmount),
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    // Update auction current highest bid
    await prisma.auction.update({
      where: { id: Number(auctionId) },
      data: { currentHighestBid: bid.bidAmount },
    });

    return bid;
  } catch (error) {
    throw new Error(`Error creating bid: ${error.message}`);
  }
};

// GET BIDS FOR AUCTION
exports.getBidsForAuction = async (auctionId) => {
  try {
    const bids = await prisma.bid.findMany({
      where: { auctionId: Number(auctionId) },
      orderBy: [{ bidAmount: "desc" }, { timestamp: "desc" }],
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    return bids;
  } catch (error) {
    throw new Error(`Error fetching bids: ${error.message}`);
  }
};

// GET HIGHEST BID FOR AUCTION
exports.getHighestBid = async (auctionId) => {
  try {
    const bid = await prisma.bid.findFirst({
      where: { auctionId: Number(auctionId) },
      orderBy: [{ bidAmount: "desc" }, { timestamp: "desc" }],
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    return bid;
  } catch (error) {
    throw new Error(`Error fetching highest bid: ${error.message}`);
  }
};

// GET USER'S BIDS
exports.getUserBids = async (userId) => {
  try {
    const bids = await prisma.bid.findMany({
      where: { userId: Number(userId) },
      orderBy: { timestamp: "desc" },
    });
    return bids;
  } catch (error) {
    throw new Error(`Error fetching user bids: ${error.message}`);
  }
};

// CLOSE AUCTION
exports.closeAuction = async (auctionId) => {
  try {
    const auction = await prisma.auction.update({
      where: { id: Number(auctionId) },
      data: { status: "closed" },
    });
    return auction;
  } catch (error) {
    if (error.code === "P2025") return null;
    throw new Error(`Error closing auction: ${error.message}`);
  }
};

// GET AUCTION HISTORY
exports.getAuctionHistory = async () => {
  try {
    const auctions = await prisma.auction.findMany({
      where: { status: "closed" },
      orderBy: { endTime: "desc" },
      include: {
        bids: { orderBy: { bidAmount: "desc" }, take: 1 },
      },
    });
    return auctions;
  } catch (error) {
    throw new Error(`Error fetching auction history: ${error.message}`);
  }
};

// GET AUCTIONS BY VENDOR (IMPORTER)
exports.getVendorAuctions = async (importerId) => {
  try {
    const auctions = await prisma.auction.findMany({
      where: { importerId: Number(importerId) },
      orderBy: { createdAt: "desc" },
      include: {
        bids: {
          orderBy: { bidAmount: "desc" },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    return auctions;
  } catch (error) {
    throw new Error(`Error fetching vendor auctions: ${error.message}`);
  }
};
