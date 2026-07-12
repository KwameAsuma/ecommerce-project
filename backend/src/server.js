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

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost",
  "http://127.0.0.1"
];

if (process.env.NGROK_URL) {
  allowedOrigins.push(process.env.NGROK_URL);
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Mount static uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================================================================
// ROUTE MOUNTING
// ============================================================================
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const financeRoutes = require("./routes/financeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const supportRoutes = require("./routes/supportRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/finances", financeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/upload", uploadRoutes);

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
      const projectRoot = path.resolve(__dirname, "..");
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
