const pool = require("../config/db");

/**
 * ProductModel.js - Raw SQL queries for native_products operations
 * All database operations for the native store are isolated here
 */

// CREATE PRODUCT
exports.createProduct = async (productData) => {
  const { vendorId, title, description, price, stockCount, category } =
    productData;
  const query = `
    INSERT INTO native_products (vendor_id, title, description, price, stock_count, category, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING id, vendor_id, title, description, price, stock_count, category, created_at;
  `;
  try {
    const result = await pool.query(query, [
      vendorId,
      title,
      description ?? null,
      price,
      stockCount,
      category ?? null,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
};

// GET ALL NATIVE PRODUCTS
exports.getAllNativeProducts = async () => {
  const query = `
    SELECT id, vendor_id, title, description, price, stock_count, category, created_at
    FROM native_products
    ORDER BY created_at DESC;
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching native products: ${error.message}`);
  }
};

// GET PRODUCT BY ID
exports.getProductById = async (productId) => {
  const query = `
    SELECT id, vendor_id, title, description, price, stock_count, category, created_at
    FROM native_products
    WHERE id = $1;
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
};

// GET PRODUCTS BY CATEGORY
exports.getProductsByCategory = async (category) => {
  const query = `
    SELECT id, vendor_id, title, description, price, stock_count, category, created_at
    FROM native_products
    WHERE category = $1
    ORDER BY created_at DESC;
  `;
  try {
    const result = await pool.query(query, [category]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching products by category: ${error.message}`);
  }
};

// GET PRODUCTS BY VENDOR
exports.getProductsByVendor = async (vendorId) => {
  const query = `
    SELECT id, vendor_id, title, description, price, stock_count, category, created_at
    FROM native_products
    WHERE vendor_id = $1
    ORDER BY created_at DESC;
  `;
  try {
    const result = await pool.query(query, [vendorId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching vendor products: ${error.message}`);
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (productId, updates) => {
  const { title, description, price, stockCount, category } = updates;
  const query = `
    UPDATE native_products
    SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        stock_count = COALESCE($4, stock_count),
        category = COALESCE($5, category)
    WHERE id = $6
    RETURNING id, vendor_id, title, description, price, stock_count, category, created_at;
  `;
  try {
    const result = await pool.query(query, [
      title,
      description,
      price,
      stockCount,
      category,
      productId,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (productId) => {
  const query = `
    DELETE FROM native_products
    WHERE id = $1
    RETURNING id;
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};
