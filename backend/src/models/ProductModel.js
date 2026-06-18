const pool = require("../config/db");

/**
 * ProductModel.js - Raw SQL queries for Product operations
 * All database operations for products are isolated here
 */

// CREATE PRODUCT
exports.createProduct = async (productData) => {
  const { name, description, price, category, imageUrl, sellerId } =
    productData;
  const query = `
    INSERT INTO products (name, description, price, category, image_url, seller_id, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING id, name, description, price, category, image_url, seller_id, created_at;
  `;
  try {
    const result = await pool.query(query, [
      name,
      description,
      price,
      category,
      imageUrl,
      sellerId,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
};

// GET ALL PRODUCTS (Native Store)
exports.getAllNativeProducts = async () => {
  const query = `
    SELECT id, name, description, price, category, image_url, seller_id, created_at
    FROM products
    WHERE category = 'native_store'
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
    SELECT id, name, description, price, category, image_url, seller_id, created_at
    FROM products
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
    SELECT id, name, description, price, category, image_url, seller_id, created_at
    FROM products
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

// GET PRODUCTS BY SELLER
exports.getProductsBySeller = async (sellerId) => {
  const query = `
    SELECT id, name, description, price, category, image_url, seller_id, created_at
    FROM products
    WHERE seller_id = $1
    ORDER BY created_at DESC;
  `;
  try {
    const result = await pool.query(query, [sellerId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching seller products: ${error.message}`);
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (productId, updates) => {
  const { name, description, price, category, imageUrl } = updates;
  const query = `
    UPDATE products
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category = COALESCE($4, category),
        image_url = COALESCE($5, image_url)
    WHERE id = $6
    RETURNING id, name, description, price, category, image_url, seller_id, created_at;
  `;
  try {
    const result = await pool.query(query, [
      name,
      description,
      price,
      category,
      imageUrl,
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
    DELETE FROM products
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
