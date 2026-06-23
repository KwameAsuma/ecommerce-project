const prisma = require("../config/prisma");

/**
 * UserModel.js - Upgraded to Prisma ORM!
 */

// CREATE USER
exports.createUser = async (userData) => {
  const { email, passwordHash, name, momoNumber } = userData;
  try {
    return await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        momoNumber,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }, // Like RETURNING in SQL
    });
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

// FIND USER BY EMAIL
exports.findByEmail = async (email) => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    throw new Error(`Error finding user by email: ${error.message}`);
  }
};

// FIND USER BY ID
exports.findById = async (userId) => {
  try {
    return await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        momoNumber: true,
        trustScore: true,
        createdAt: true,
      },
    });
  } catch (error) {
    throw new Error(`Error finding user by ID: ${error.message}`);
  }
};

// GET ALL USERS
exports.getAllUsers = async () => {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        momoNumber: true,
        trustScore: true,
        createdAt: true,
      },
    });
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

// UPDATE USER
exports.updateUser = async (userId, updates) => {
  const { email, name, momoNumber } = updates;
  try {
    return await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        ...(email && { email }),
        ...(name && { name }),
        ...(momoNumber && { momoNumber }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        momoNumber: true,
        trustScore: true,
      },
    });
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

// DELETE USER
exports.deleteUser = async (userId) => {
  try {
    return await prisma.user.delete({
      where: { id: parseInt(userId) },
      select: { id: true },
    });
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};
