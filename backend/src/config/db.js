const { Pool } = require("pg");

// Initialize the PostgreSQL connection pool using Docker-injected environment variables
const pool = new Pool({
  host: process.env.DB_HOST, // Evaluates to 'db' (Docker service name)
  port: process.env.DB_PORT, // Evaluates to 5432
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error connecting to PostgreSQL:", err.stack);
  } else {
    console.log("✅ Successfully connected to PostgreSQL database!");
    release();
  }
});

// Export the pool for use in Models
module.exports = pool;
