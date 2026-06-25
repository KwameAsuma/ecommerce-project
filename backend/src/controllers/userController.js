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

module.exports = { getDashboard };
