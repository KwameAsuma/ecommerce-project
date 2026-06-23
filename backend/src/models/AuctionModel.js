const pool = require("../config/db");

/**
 * AuctionModel.js - Raw SQL queries for Auction and Bid operations
 * All database operations for auctions are isolated here
 */

// CREATE AUCTION
exports.createAuction = async (auctionData) => {
  const { importerId, title, basePrice, endTime } = auctionData;
  const query = `
    INSERT INTO auctions (importer_id, title, base_price, current_highest_bid, status, end_time, created_at)
    VALUES ($1, $2, $3, 0, 'active', $4, NOW())
    RETURNING id, importer_id, title, base_price, current_highest_bid, status, end_time, created_at;
  `;
  try {
    const result = await pool.query(query, [
      importerId,
      title,
      basePrice,
      endTime,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating auction: ${error.message}`);
  }
};

// GET ACTIVE AUCTIONS
exports.getActiveAuctions = async () => {
  const query = `
    SELECT id, importer_id, title, base_price, current_highest_bid, status, end_time, created_at
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
    SELECT id, importer_id, title, base_price, current_highest_bid, status, end_time, created_at
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
  const { auctionId, userId, bidAmount } = bidData;
  const query = `
    INSERT INTO bids (auction_id, user_id, bid_amount, timestamp)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, auction_id, user_id, bid_amount, timestamp;
  `;
  try {
    const result = await pool.query(query, [auctionId, userId, bidAmount]);

    await pool.query(
      "UPDATE auctions SET current_highest_bid = $1 WHERE id = $2",
      [bidAmount, auctionId],
    );

    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating bid: ${error.message}`);
  }
};

// GET BIDS FOR AUCTION
exports.getBidsForAuction = async (auctionId) => {
  const query = `
    SELECT id, auction_id, user_id, bid_amount, timestamp
    FROM bids
    WHERE auction_id = $1
    ORDER BY bid_amount DESC, timestamp DESC;
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
    SELECT id, user_id, bid_amount, timestamp
    FROM bids
    WHERE auction_id = $1
    ORDER BY bid_amount DESC, timestamp DESC
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
    SELECT id, auction_id, bid_amount, timestamp
    FROM bids
    WHERE user_id = $1
    ORDER BY timestamp DESC;
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
    RETURNING id, importer_id, title, base_price, current_highest_bid, status, end_time;
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
    SELECT id, importer_id, title, base_price, current_highest_bid, status, end_time, created_at
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
