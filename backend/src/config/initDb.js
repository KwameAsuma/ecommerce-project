const pool = require("./db");

/**
 * initDb.js - Database Initialization
 * Creates all required tables on startup if they don't exist
 * This ensures the database schema is always ready when the app starts
 */

const initDb = async () => {
  try {
    console.log("🔧 Initializing database tables...");

    // ========================================================================
    // TABLE 1: USERS
    // ========================================================================
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        momo_number VARCHAR(20),
        role VARCHAR(50) DEFAULT 'buyer',
        trust_score INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // ========================================================================
    // TABLE 2: NATIVE_PRODUCTS
    // ========================================================================
    const createNativeProductsTable = `
      CREATE TABLE IF NOT EXISTS native_products (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock_count INTEGER NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_vendor FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // ========================================================================
    // TABLE 3: AUCTIONS
    // ========================================================================
    const createAuctionsTable = `
      CREATE TABLE IF NOT EXISTS auctions (
        id SERIAL PRIMARY KEY,
        importer_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        base_price DECIMAL(10, 2) NOT NULL,
        current_highest_bid DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        end_time TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_importer FOREIGN KEY (importer_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // ========================================================================
    // TABLE 4: BIDS
    // ========================================================================
    const createBidsTable = `
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        auction_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        bid_amount DECIMAL(10, 2) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_auction FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
        CONSTRAINT fk_bidder FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Execute all CREATE TABLE statements
    await pool.query(createUsersTable);
    console.log("  ✅ Users table created/verified");

    await pool.query(createNativeProductsTable);
    console.log("  ✅ Native_Products table created/verified");

    await pool.query(createAuctionsTable);
    console.log("  ✅ Auctions table created/verified");

    await pool.query(createBidsTable);
    console.log("  ✅ Bids table created/verified");

    console.log("✅ Database initialization complete! All tables are ready.");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    console.error("Stack trace:", error.stack);
    return false;
  }
};

// Export the initialization function
module.exports = initDb;
