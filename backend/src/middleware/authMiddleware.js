const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Not authorized. No session token found." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: "Not authorized. User no longer exists." });
    }

    req.userId = user.id;

    // Standardize role for easy checking
    req.user = {
      ...user,
      role: user.role?.toUpperCase() === 'ADMIN' ? 'admin' : ((user.role?.toUpperCase() === 'MERCHANT' || user.role?.toUpperCase() === 'VENDOR') ? 'merchant' : 'customer')
    };

    // Rolling Session: Issue a fresh token on active requests
    const newToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    next();
  } catch (error) {
    console.error("Auth middleware token error:", error.message);
    return res.status(401).json({ error: "Not authorized. Token is invalid or expired." });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. You do not have permission to perform this action." });
    }
    next();
  };
};

module.exports = { protect, restrictTo };