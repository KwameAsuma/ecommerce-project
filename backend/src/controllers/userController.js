const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const attachNeedsSetup = (rawUser, safeUser) => {
  if (!safeUser || !rawUser) return;
  if (safeUser.role === "admin") {
    safeUser.needsSetup = false;
    return;
  }
  const defaultPrefix = rawUser.email ? rawUser.email.split("@")[0] : "";
  const isDefaultPhone = !rawUser.phone || rawUser.phone === "0000000000";
  const isDefaultName = !rawUser.name || rawUser.name === defaultPrefix || rawUser.name === "New User";
  
  if (safeUser.role === "merchant" || safeUser.role === "vendor") {
    const isDefaultMomo = !rawUser.momoNumber || rawUser.momoNumber === "0000000000";
    safeUser.needsSetup = isDefaultPhone || isDefaultMomo || isDefaultName || !rawUser.storeAddress;
  } else {
    safeUser.needsSetup = isDefaultPhone || isDefaultName || !rawUser.deliveryAddress;
  }
};

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
      where: { role: { in: ['MERCHANT', 'merchant', 'VENDOR', 'vendor'] } },
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
      where: { id, role: { in: ['MERCHANT', 'merchant', 'VENDOR', 'vendor'] } },
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
    const {
      name, email, phone, momoNumber, currency, language, theme,
      deliveryAddress, orderUpdates, promotions, priceDropAlerts,
      storeDescription, supportEmail, supportPhone, storeAddress,
      taxId, returnPolicy, avatarUrl, storeBannerUrl,
      emailNotifications, lowStockWarnings, bidAlerts,
      dailySalesDigest, marketingEmails
    } = req.body;
    
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (momoNumber !== undefined) data.momoNumber = momoNumber;
    if (currency !== undefined) data.currency = currency;
    if (language !== undefined) data.language = language;
    if (theme !== undefined) data.theme = theme;
    if (deliveryAddress !== undefined) data.deliveryAddress = deliveryAddress;
    if (orderUpdates !== undefined) data.orderUpdates = orderUpdates;
    if (promotions !== undefined) data.promotions = promotions;
    if (priceDropAlerts !== undefined) data.priceDropAlerts = priceDropAlerts;
    if (storeDescription !== undefined) data.storeDescription = storeDescription;
    if (supportEmail !== undefined) data.supportEmail = supportEmail;
    if (supportPhone !== undefined) data.supportPhone = supportPhone;
    if (storeAddress !== undefined) data.storeAddress = storeAddress;
    if (taxId !== undefined) data.taxId = taxId;
    if (returnPolicy !== undefined) data.returnPolicy = returnPolicy;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (storeBannerUrl !== undefined) data.storeBannerUrl = storeBannerUrl;
    if (emailNotifications !== undefined) data.emailNotifications = emailNotifications;
    if (lowStockWarnings !== undefined) data.lowStockWarnings = lowStockWarnings;
    if (bidAlerts !== undefined) data.bidAlerts = bidAlerts;
    if (dailySalesDigest !== undefined) data.dailySalesDigest = dailySalesDigest;
    if (marketingEmails !== undefined) data.marketingEmails = marketingEmails;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const isVendor = updatedUser.role?.toUpperCase() === "MERCHANT" || 
                     updatedUser.role?.toUpperCase() === "VENDOR" || 
                     (updatedUser.email && (updatedUser.email.toLowerCase().includes("vendor") || updatedUser.email.toLowerCase().includes("merchant"))) || 
                     (updatedUser.name && (updatedUser.name.toLowerCase().includes("vendor") || updatedUser.name.toLowerCase().includes("merchant")));
                     
    if (isVendor && !['merchant', 'MERCHANT', 'vendor', 'VENDOR'].includes(updatedUser.role)) {
      await prisma.user.update({ where: { id: userId }, data: { role: "merchant" } }).catch(e => console.error("Auto-heal DB role failed:", e));
    }

    const { passwordHash: _, ...safeUser } = updatedUser;
    safeUser.role = updatedUser.role?.toUpperCase() === "ADMIN" ? "admin" : isVendor ? "merchant" : "customer";
    attachNeedsSetup(updatedUser, safeUser);

    res.status(200).json({ status: "success", user: safeUser });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (dbError) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}_${Date.now()}@deleted.com`,
          name: "Deleted User",
          passwordHash: "deleted_account",
        },
      });
    }
    res.clearCookie("token");
    res.status(200).json({ status: "success", message: "Account deleted successfully." });
  } catch (error) {
    console.error("deleteAccount error:", error);
    res.status(500).json({ error: "Failed to delete account." });
  }
};

module.exports = { getDashboard, getMerchants, getUserById, getMerchantProfile, updateProfile, deleteAccount };
