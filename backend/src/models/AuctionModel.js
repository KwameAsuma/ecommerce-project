const pool = require("../config/db");

/**
 * AuctionModel.js - Raw SQL queries for Auction and Bid operations
 * All database operations for auctions are isolated here
 */

// CREATE AUCTION
exports.createAuction = async (auctionData) => {
  const { productId, startingBid, endTime, sellerId } = auctionData;
  const query = `
    INSERT INTO auctions (product_id, starting_bid, current_bid, end_time, seller_id, status, created_at)
    VALUES ($1, $2, $2, $3, $4, 'active', NOW())
    RETURNING id, product_id, starting_bid, current_bid, end_time, seller_id, status, created_at;
  `;
  try {
    const result = await pool.query(query, [
      productId,
      startingBid,
      endTime,
      sellerId,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating auction: ${error.message}`);
  }
};

// GET ACTIVE AUCTIONS
exports.getActiveAuctions = async () => {
  const query = `
    SELECT id, product_id, starting_bid, current_bid, end_time, seller_id, status, created_at
    FROM auctions
    WHERE status = 'active' AND end_time > NOW()
    ORDER BY end_time ASC;
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching active auctions: ${error.message}`);
  }
};

// GET AUCTION BY ID
exports.getAuctionById = async (auctionId) => {
  const query = `
    SELECT id, product_id, starting_bid, current_bid, end_time, seller_id, status, created_at
    FROM auctions
    WHERE id = $1;
  `;
  try {
    const result = await pool.query(query, [auctionId]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error fetching auction: ${error.message}`);
  }
};

// CREATE BID
exports.createBid = async (bidData) => {
  const { auctionId, bidderId, bidAmount } = bidData;
  const query = `
    INSERT INTO bids (auction_id, bidder_id, bid_amount, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, auction_id, bidder_id, bid_amount, created_at;
  `;
  try {
    const result = await pool.query(query, [auctionId, bidderId, bidAmount]);

    // Update current_bid in auctions table
    await pool.query("UPDATE auctions SET current_bid = $1 WHERE id = $2", [
      bidAmount,
      auctionId,
    ]);

    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating bid: ${error.message}`);
  }
};

// GET BIDS FOR AUCTION
exports.getBidsForAuction = async (auctionId) => {
  const query = `
    SELECT id, auction_id, bidder_id, bid_amount, created_at
    FROM bids
    WHERE auction_id = $1
    ORDER BY bid_amount DESC, created_at DESC;
  `;
  try {
    const result = await pool.query(query, [auctionId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching bids: ${error.message}`);
  }
};

// GET HIGHEST BID FOR AUCTION
exports.getHighestBid = async (auctionId) => {
  const query = `
    SELECT id, bidder_id, bid_amount, created_at
    FROM bids
    WHERE auction_id = $1
    ORDER BY bid_amount DESC
    LIMIT 1;
  `;
  try {
    const result = await pool.query(query, [auctionId]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error fetching highest bid: ${error.message}`);
  }
};

// GET USER'S BIDS
exports.getUserBids = async (userId) => {
  const query = `
    SELECT id, auction_id, bid_amount, created_at
    FROM bids
    WHERE bidder_id = $1
    ORDER BY created_at DESC;
  `;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching user bids: ${error.message}`);
  }
};

// CLOSE AUCTION
exports.closeAuction = async (auctionId) => {
  const query = `
    UPDATE auctions
    SET status = 'closed'
    WHERE id = $1
    RETURNING id, product_id, current_bid, status;
  `;
  try {
    const result = await pool.query(query, [auctionId]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error closing auction: ${error.message}`);
  }
};

// GET AUCTION HISTORY
exports.getAuctionHistory = async () => {
  const query = `
    SELECT id, product_id, starting_bid, current_bid, end_time, seller_id, status, created_at
    FROM auctions
    WHERE status = 'closed'
    ORDER BY end_time DESC;
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching auction history: ${error.message}`);
  }
};
