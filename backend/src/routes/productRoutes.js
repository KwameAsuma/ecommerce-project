const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { validateProductCreate, validateProductUpdate, validateIdParam, validateVendorIdParam, validateCategoryParam } = require("../middleware/validators");

// Order routes so that specific paths are matched before the generic `/:id` param
router.post("/", validateProductCreate, productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/category/:category", validateCategoryParam, productController.getProductsByCategory);
router.get("/vendor/:vendorId", validateVendorIdParam, productController.getProductsByVendor);
router.get("/:id", validateIdParam, productController.getProductById);
router.put("/:id", validateProductUpdate, productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
