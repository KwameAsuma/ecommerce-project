const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows your React frontend to make requests to this backend
app.use(express.json()); // Allows your server to read JSON data sent in requests

// Set up the Database Connection Pool
// Docker automatically injects these environment variables from your docker-compose.yml
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error acquiring client", err.stack);
  } else {
    console.log("Successfully connected to PostgreSQL database!");
    release();
  }
});

// The Base API Route
// NGINX routes traffic from http://localhost/api directly to this endpoint
app.get("/api", async (req, res) => {
  try {
    const dbResult = await pool.query("SELECT NOW()");
    res.json({
      status: "success",
      message: "Node.js backend is running and connected to the database!",
      timestamp: dbResult.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
