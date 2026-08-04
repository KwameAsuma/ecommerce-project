const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getSystemStats,
  changeUserPassword,
  changeUserRole,
  updateUserWallet,
  getAllProducts,
  deleteProduct,
  createProductAsAdmin,
  editProduct,
  getAllAuctions,
  deleteAuction,
  createAuctionAsAdmin,
  forceCloseAuction
} = require("../controllers/adminController");

const router = express.Router();

// All routes require user to be logged in AND be an admin
router.use(protect);
router.use(isAdmin);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/password", changeUserPassword);
router.put("/users/:id/role", changeUserRole);
router.put("/users/:id/wallet", updateUserWallet);

router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

router.get("/products", getAllProducts);
router.delete("/products/:id", deleteProduct);
router.post("/products", createProductAsAdmin);
router.put("/products/:id", editProduct);

router.get("/auctions", getAllAuctions);
router.delete("/auctions/:id", deleteAuction);
router.post("/auctions", createAuctionAsAdmin);
router.put("/auctions/:id/close", forceCloseAuction);

router.get("/stats", getSystemStats);

module.exports = router;
