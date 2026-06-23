const ProductModel = require("../models/ProductModel");

exports.createProduct = async (req, res) => {
  try {
    const product = await ProductModel.createProduct(req.body);
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.getAllNativeProducts();
    res.status(200).json({ status: "success", products });
  } catch (error) {
    console.error("Error fetching native products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await ProductModel.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ status: "success", product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await ProductModel.getProductsByCategory(
      req.params.category,
    );
    res.status(200).json({ status: "success", products });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: "Failed to fetch category products" });
  }
};

exports.getProductsByVendor = async (req, res) => {
  try {
    const products = await ProductModel.getProductsByVendor(
      req.params.vendorId,
    );
    res.status(200).json({ status: "success", products });
  } catch (error) {
    console.error("Error fetching products by vendor:", error);
    res.status(500).json({ error: "Failed to fetch vendor products" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await ProductModel.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ error: "Product not found to update" });
    }
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedId = await ProductModel.deleteProduct(req.params.id);
    if (!deletedId) {
      return res.status(404).json({ error: "Product not found to delete" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
