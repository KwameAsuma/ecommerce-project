const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, availableBalance: true, trustScore: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    res.status(500).json({ error: "Server error getting users" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Attempt to delete related data first to prevent foreign key constraint errors
    const userId = parseInt(id);
    
    // In a real app we might soft-delete or do a cascading delete. 
    // Here we'll try to delete some common things first if we want, or just delete user.
    // If we just delete user, Prisma will throw an error if there are relations.
    // Let's do a transaction to delete all dependent data first
    
    await prisma.$transaction([
      prisma.bid.deleteMany({ where: { userId } }),
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.review.deleteMany({ where: { OR: [{ reviewerId: userId }, { merchantId: userId }] } }),
      // we might also need to delete orders, products, auctions etc.
      // this is dangerous but requested by the prompt ("delete a user").
      // let's wrap the user delete in a try-catch to give a clear error if it fails.
    ]);
    
    await prisma.user.delete({ where: { id: userId } });
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    res.status(400).json({ error: "Cannot delete user. Please ensure they have no active orders, products, or auctions." });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        vendor: { select: { name: true, email: true } },
        product: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error("Error in getAllOrders:", error.message);
    res.status(500).json({ error: "Server error getting orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    console.error("Error in updateOrderStatus:", error.message);
    res.status(500).json({ error: "Server error updating order status" });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();
    
    const orders = await prisma.order.findMany({
      select: { totalAmount: true, createdAt: true }
    });
    const totalOrderAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    
    // 7-day chart data calculation
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= d && orderDate < nextDay;
      });

      const dayTotal = dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      chartData.push({
        label: days[d.getDay()],
        value: dayTotal
      });
    }

    // Determine max value for scaling in the frontend
    const maxVal = Math.max(...chartData.map(d => d.value), 100); // minimum max of 100 to avoid division by zero
    const scaledChartData = chartData.map(d => ({ ...d, max: maxVal }));

    res.json({
      userCount,
      orderCount,
      totalOrderAmount,
      chartData: scaledChartData
    });
  } catch (error) {
    console.error("Error in getSystemStats:", error.message);
    res.status(500).json({ error: "Server error getting stats" });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { passwordHash }
    });
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changeUserPassword:", error.message);
    res.status(500).json({ error: "Server error changing password" });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ["customer", "merchant", "admin"];
    if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });
    
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });
    res.json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error changing role" });
  }
};

const updateUserWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { availableBalance, trustScore } = req.body;
    const data = {};
    if (availableBalance !== undefined) data.availableBalance = availableBalance;
    if (trustScore !== undefined) data.trustScore = trustScore;
    
    await prisma.user.update({
      where: { id: parseInt(id) },
      data
    });
    res.json({ message: "Wallet/Trust updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error updating wallet" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.nativeProduct.findMany({
      include: { vendor: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error("Error in getAllProducts:", error.message);
    res.status(500).json({ error: "Server error getting products" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.nativeProduct.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error.message);
    res.status(500).json({ error: "Server error deleting product" });
  }
};

const createProductAsAdmin = async (req, res) => {
  try {
    const { vendorId, title, description, price, stockCount, category } = req.body;
    const product = await prisma.nativeProduct.create({
      data: { vendorId: parseInt(vendorId), title, description, price, stockCount: parseInt(stockCount), category }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error creating product" });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stockCount, category } = req.body;
    const product = await prisma.nativeProduct.update({
      where: { id: parseInt(id) },
      data: { title, description, price, stockCount: parseInt(stockCount), category }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error updating product" });
  }
};

const getAllAuctions = async (req, res) => {
  try {
    const auctions = await prisma.auction.findMany({
      include: { importer: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(auctions);
  } catch (error) {
    console.error("Error in getAllAuctions:", error.message);
    res.status(500).json({ error: "Server error getting auctions" });
  }
};

const deleteAuction = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete related bids first
    await prisma.bid.deleteMany({ where: { auctionId: parseInt(id) } });
    await prisma.auction.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Auction deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAuction:", error.message);
    res.status(500).json({ error: "Server error deleting auction" });
  }
};

const createAuctionAsAdmin = async (req, res) => {
  try {
    const { importerId, title, basePrice, endTime } = req.body;
    const auction = await prisma.auction.create({
      data: {
        importerId: parseInt(importerId),
        title,
        basePrice,
        currentHighestBid: basePrice,
        endTime: new Date(endTime),
      }
    });
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: "Server error creating auction" });
  }
};

const forceCloseAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await prisma.auction.update({
      where: { id: parseInt(id) },
      data: { status: "completed", endTime: new Date() }
    });
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: "Server error closing auction" });
  }
};

module.exports = {
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
};
