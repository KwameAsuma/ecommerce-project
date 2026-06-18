const pool = require("../config/db");

/**
 * UserModel.js - Raw SQL queries for User operations
 * All database operations for users are isolated here
 */

// CREATE USER
exports.createUser = async (userData) => {
  const { email, password, fullName } = userData;
  const query = `
    INSERT INTO users (email, password, full_name, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, email, full_name, created_at;
  `;
  try {
    const result = await pool.query(query, [email, password, fullName]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

// FIND USER BY EMAIL
exports.findByEmail = async (email) => {
  const query = `
    SELECT id, email, password, full_name, created_at
    FROM users
    WHERE email = $1;
  `;
  try {
    const result = await pool.query(query, [email]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error finding user by email: ${error.message}`);
  }
};

// FIND USER BY ID
exports.findById = async (userId) => {
  const query = `
    SELECT id, email, full_name, created_at
    FROM users
    WHERE id = $1;
  `;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error finding user by ID: ${error.message}`);
  }
};

// GET ALL USERS
exports.getAllUsers = async () => {
  const query = `
    SELECT id, email, full_name, created_at
    FROM users
    ORDER BY created_at DESC;
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

// UPDATE USER
exports.updateUser = async (userId, updates) => {
  const { email, fullName } = updates;
  const query = `
    UPDATE users
    SET email = COALESCE($1, email), full_name = COALESCE($2, full_name)
    WHERE id = $3
    RETURNING id, email, full_name, created_at;
  `;
  try {
    const result = await pool.query(query, [email, fullName, userId]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

// DELETE USER
exports.deleteUser = async (userId) => {
  const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id;
  `;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};
