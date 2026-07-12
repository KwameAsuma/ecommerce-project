const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const adminCheck = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authorized" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden: Admin access required." });
    }
    next();
  } catch (error) {
    console.error("Admin middleware error:", error.message);
    res.status(500).json({ error: "Server error checking admin privileges." });
  }
};

module.exports = { adminCheck };
