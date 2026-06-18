const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import the database config (this tests the connection on startup)
require("./config/db");

// Import the database initialization function
const initDb = require("./config/initDb");

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows your React frontend to make requests to this backend
app.use(express.json()); // Allows your server to read JSON data sent in requests

// ============================================================================
// ROUTE MOUNTING (Routes will be imported here as we build Phase 3)
// ============================================================================

// Example structure (uncomment as routes are created):
// const authRoutes = require("./routes/authRoutes");
// const productRoutes = require("./routes/productRoutes");
// const auctionRoutes = require("./routes/auctionRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/auctions", auctionRoutes);

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

// The Base API Route (useful for testing)
app.get("/api", async (req, res) => {
  try {
    res.json({
      status: "success",
      message: "Node.js backend is running and connected to the database!",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ============================================================================
// START THE SERVER
// ============================================================================

// Initialize database tables and start the server
const startServer = async () => {
  try {
    // Initialize database tables (runs on every startup)
    await initDb();

    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`✅ Backend server is running on port ${PORT}`);
      console.log(
        `📡 NGINX routing traffic from http://localhost/api to this port`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Call the startup function
startServer();
