const { body, param, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateRegister = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
  body("name").notEmpty().withMessage("Name is required"),
  handleValidation,
];

exports.validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

exports.validateProductCreate = [
  body("title").notEmpty().withMessage("title is required"),
  body("price").isFloat({ gt: 0 }).withMessage("price must be a positive number"),
  body("stockCount").isInt({ min: 0 }).withMessage("stockCount must be integer >= 0"),
  handleValidation,
];

exports.validateProductUpdate = [
  body("price").optional().isFloat({ gt: 0 }).withMessage("price must be a positive number"),
  body("stockCount").optional().isInt({ min: 0 }).withMessage("stockCount must be integer >= 0"),
  handleValidation,
];

exports.validateAuctionCreate = [
  body("title").notEmpty().withMessage("title is required"),
  body("basePrice").isFloat({ gt: 0 }).withMessage("basePrice must be positive"),
  body("endTime").isISO8601().withMessage("endTime must be ISO8601 timestamp"),
  handleValidation,
];

exports.validateBidCreate = [
  body("userId").isInt().withMessage("userId must be integer"),
  body("bidAmount").isFloat({ gt: 0 }).withMessage("bidAmount must be positive"),
  handleValidation,
];

// PARAM validators
exports.validateIdParam = [
  param("id").isInt().withMessage("id must be an integer"),
  handleValidation,
];

exports.validateVendorIdParam = [
  param("vendorId").isInt().withMessage("vendorId must be an integer"),
  handleValidation,
];

exports.validateUserIdParam = [
  param("userId").isInt().withMessage("userId must be an integer"),
  handleValidation,
];

exports.validateCategoryParam = [
  param("category").isString().notEmpty().withMessage("category is required"),
  handleValidation,
];
