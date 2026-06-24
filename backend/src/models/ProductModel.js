const prisma = require("../config/prisma");

/**
 * ProductModel - Prisma-based implementations for native_products
 */

// CREATE PRODUCT
exports.createProduct = async (productData) => {
  const { vendorId, title, description, price, stockCount, category } =
    productData;
  try {
    const product = await prisma.nativeProduct.create({
      data: {
        vendorId,
        title,
        description: description ?? null,
        price: price?.toString?.() ?? String(price),
        stockCount,
        category: category ?? null,
      },
      select: {
        id: true,
        vendorId: true,
        title: true,
        description: true,
        price: true,
        stockCount: true,
        category: true,
        createdAt: true,
      },
    });
    return product;
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
};

// GET ALL NATIVE PRODUCTS
exports.getAllNativeProducts = async () => {
  try {
    const products = await prisma.nativeProduct.findMany({
      orderBy: { createdAt: "desc" },
    });
    return products;
  } catch (error) {
    throw new Error(`Error fetching native products: ${error.message}`);
  }
};

// GET PRODUCT BY ID
exports.getProductById = async (productId) => {
  try {
    const product = await prisma.nativeProduct.findUnique({
      where: { id: Number(productId) },
    });
    return product;
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
};

// GET PRODUCTS BY CATEGORY
exports.getProductsByCategory = async (category) => {
  try {
    const products = await prisma.nativeProduct.findMany({
      where: { category: category },
      orderBy: { createdAt: "desc" },
    });
    return products;
  } catch (error) {
    throw new Error(`Error fetching products by category: ${error.message}`);
  }
};

// GET PRODUCTS BY VENDOR
exports.getProductsByVendor = async (vendorId) => {
  try {
    const products = await prisma.nativeProduct.findMany({
      where: { vendorId: Number(vendorId) },
      orderBy: { createdAt: "desc" },
    });
    return products;
  } catch (error) {
    throw new Error(`Error fetching vendor products: ${error.message}`);
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (productId, updates) => {
  try {
    const data = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.price !== undefined) data.price = updates.price.toString();
    if (updates.stockCount !== undefined) data.stockCount = updates.stockCount;
    if (updates.category !== undefined) data.category = updates.category;

    const product = await prisma.nativeProduct.update({
      where: { id: Number(productId) },
      data,
    });
    return product;
  } catch (error) {
    // If record not found, Prisma throws — normalize to null
    if (error.code === "P2025") return null;
    throw new Error(`Error updating product: ${error.message}`);
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (productId) => {
  try {
    const deleted = await prisma.nativeProduct.delete({
      where: { id: Number(productId) },
      select: { id: true },
    });
    return deleted;
  } catch (error) {
    if (error.code === "P2025") return null;
    throw new Error(`Error deleting product: ${error.message}`);
  }
};
