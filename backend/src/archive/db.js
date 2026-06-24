const { Pool } = require("pg");

// Archived DB pool for reference. Prisma is now the primary DB interface.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error connecting to PostgreSQL:", err.stack);
  } else {
    console.log("✅ Archived: connected to PostgreSQL database (db.js)");
    release();
  }
});

module.exports = pool;
