const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bids: {
          include: {
            auction: true,
          },
          orderBy: {
            timestamp: 'desc'
          }
        },
        products: {
          orderBy: {
            createdAt: 'desc'
          }
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      status: "success",
      data: {
        bids: user.bids,
        products: user.products,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};

const getMerchants = async (req, res) => {
  try {
    const merchants = await prisma.user.findMany({
      where: { role: { in: ['MERCHANT', 'merchant'] } },
      select: {
        id: true,
        name: true,
        email: true,
        trustScore: true,
        createdAt: true,
        avatarUrl: true,
        storeBannerUrl: true,
        _count: {
          select: {
            products: true,
            vendorOrders: true,
          },
        },
        reviewsReceived: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewer: { select: { name: true } }
          }
        }
      },
      orderBy: { trustScore: 'desc' },
    });

    const formatted = merchants.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      trustScore: m.trustScore,
      createdAt: m.createdAt,
      avatarUrl: m.avatarUrl,
      storeBannerUrl: m.storeBannerUrl,
      productCount: m._count.products,
      salesCount: m._count.vendorOrders,
      recentReviews: m.reviewsReceived,
      averageRating: m.trustScore / 20,
    }));

    res.status(200).json({ status: 'success', data: formatted });
  } catch (error) {
    console.error('getMerchants error:', error);
    res.status(500).json({ error: 'Failed to fetch merchants.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid user ID" });

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const getMerchantProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid merchant ID" });

    const merchant = await prisma.user.findFirst({
      where: { id, role: { in: ['MERCHANT', 'merchant'] } },
      select: {
        id: true,
        name: true,
        email: true,
        trustScore: true,
        createdAt: true,
        avatarUrl: true,
        storeBannerUrl: true,
        products: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            products: true,
            vendorOrders: true,
          },
        },
        reviewsReceived: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewer: { select: { name: true } }
          }
        }
      }
    });

    if (!merchant) return res.status(404).json({ error: "Merchant not found" });

    const formatted = {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
      trustScore: merchant.trustScore,
      createdAt: merchant.createdAt,
      avatarUrl: merchant.avatarUrl,
      storeBannerUrl: merchant.storeBannerUrl,
      products: merchant.products,
      productCount: merchant._count.products,
      salesCount: merchant._count.vendorOrders,
      recentReviews: merchant.reviewsReceived,
      averageRating: merchant.trustScore / 20,
    };

    res.json(formatted);
  } catch (error) {
    console.error("getMerchantProfile error:", error);
    res.status(500).json({ error: "Failed to fetch merchant profile" });
  }
};

const updateProfile = async (req, res) => {
  // Triggering nodemon restart to load updated Prisma client
  try {
    const userId = req.userId;
    const { name, email, currency, language, deliveryAddress, orderUpdates, promotions, priceDropAlerts, avatarUrl } = req.body;
    
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (currency !== undefined) data.currency = currency;
    if (language !== undefined) data.language = language;
    if (deliveryAddress !== undefined) data.deliveryAddress = deliveryAddress;
    if (orderUpdates !== undefined) data.orderUpdates = orderUpdates;
    if (promotions !== undefined) data.promotions = promotions;
    if (priceDropAlerts !== undefined) data.priceDropAlerts = priceDropAlerts;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { passwordHash: _, ...safeUser } = updatedUser;
    safeUser.role = updatedUser.role?.toUpperCase() === "ADMIN" ? "admin" : updatedUser.role?.toUpperCase() === "MERCHANT" ? "merchant" : "customer";

    res.status(200).json({ status: "success", user: safeUser });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
};

module.exports = { getDashboard, getMerchants, getUserById, getMerchantProfile, updateProfile };
