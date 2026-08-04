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
  body("title").trim().notEmpty().withMessage("Auction title is required"),
  body("basePrice").isFloat({ gt: 0 }).withMessage("Base price must be a positive number"),
  body("endTime").isISO8601().withMessage("Auction end time must be a valid date and time"),
  body("imageUrl").optional({ checkFalsy: true, nullable: true }).isString(),
  body("brand").optional({ checkFalsy: true, nullable: true }).isString(),
  body("description").optional({ checkFalsy: true, nullable: true }).isString(),
  body("condition").optional({ checkFalsy: true, nullable: true }).isString(),
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
