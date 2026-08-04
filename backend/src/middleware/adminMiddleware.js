/**
 * Admin Security Gatekeeper Middleware
 * Assumes req.user has already been populated by authMiddleware (protect)
 */
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role?.toUpperCase() === 'ADMIN')) {
    return next();
  }
  return res.status(403).json({ error: "Access denied. Admin credentials required." });
};

// Export isAdmin and alias adminCheck for existing route compatibility
module.exports = { isAdmin, adminCheck: isAdmin };
