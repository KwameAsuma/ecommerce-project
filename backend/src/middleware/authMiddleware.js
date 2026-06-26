const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // Read the token directly from the secure cookies parsing engine
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Not authorized. No session token found." });
    }

    // Verify token identity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the verified user ID to the request object for downstream controllers
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth middleware token error:", error.message);
    return res.status(401).json({ error: "Not authorized. Token is invalid or expired." });
  }
};

module.exports = { protect };