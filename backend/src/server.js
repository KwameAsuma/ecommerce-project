const express = require("express");
const cors = require("cors");
const http = require("http"); // <-- 1. Import HTTP module
const { Server } = require("socket.io"); // <-- 2. Import Socket.io
const cookieParser = require("cookie-parser");
require("dotenv").config();

// DB pool removed in favor of Prisma. Prisma is the single source of truth for DB access.
const { execSync } = require("child_process");
const path = require("path");

const app = express();

// 3. Wrap Express inside an HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // NGINX handles security and routing from the frontend
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ============================================================================
// ROUTE MOUNTING
// ============================================================================
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const auctionRoutes = require("./routes/auctionRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auctions", auctionRoutes);

// ============================================================================
// WEBSOCKET MOUNTING
// ============================================================================
// 4. Pass the Socket.io instance to our new controller
require("./controllers/socketController")(io);

// ============================================================================
// HEALTH CHECK & ERROR HANDLING
// ============================================================================
app.get("/api", async (req, res) => {
  res.json({ status: "success", message: "API is running!" });
});

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) =>
  res.status(500).json({ error: "Internal Server Error" }),
);

// ============================================================================
// START THE SERVER
// ============================================================================
const startServer = async () => {
  try {
    // Ensure Prisma client is generated and push the schema to the database
    try {
      const projectRoot = path.resolve(__dirname, "..", "..");
      console.log("🔁 Running Prisma generate and db push to ensure schema is applied...");
      execSync("npx prisma generate", { stdio: "inherit", cwd: projectRoot });
      execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", cwd: projectRoot });
      console.log("✅ Prisma schema pushed to database");
    } catch (prismaErr) {
      console.warn("⚠️ Prisma push failed (you may be using external migrations):", prismaErr.message);
    }

    // 5. CRITICAL: Use server.listen() instead of app.listen() to start both API and WebSockets
    server.listen(PORT, () => {
      console.log(`✅ Backend API is running on port ${PORT}`);
      console.log(`⚡ WebSocket Engine is active and listening`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
