// backend/src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

// Initialize Prisma
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
  try {
    const { email, phone, password, name, momo_number, role } = req.body;

    if (!email || !phone || !password || !name) {
      return res
        .status(400)
        .json({ error: "Name, email, phone, and password are required." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        phone: phone,
        passwordHash: passwordHash, // Matches your schema exactly
        name: name,
        role: role || "BUYER",
        momoNumber: momo_number || null, // Optional field
      },
    });

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    safeUser.role = newUser.role?.toUpperCase() === "ADMIN" ? "admin" : newUser.role?.toUpperCase() === "MERCHANT" ? "merchant" : "customer";

    return res.status(201).json({
      message: "Registration successful",
      user: safeUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = user;
    safeUser.role = user.role?.toUpperCase() === "ADMIN" ? "admin" : user.role?.toUpperCase() === "MERCHANT" ? "merchant" : "customer";

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
};

const getMe = async (req, res) => {
  try {
    // req.userId was attached by our protect middleware
    // Replace old Model logic with Prisma
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User profile no longer exists." });
    }

    const { passwordHash: _, ...safeUser } = user;
    safeUser.role = user.role?.toUpperCase() === "ADMIN" ? "admin" : user.role?.toUpperCase() === "MERCHANT" ? "merchant" : "customer";

    return res.status(200).json({
      status: "success",
      user: safeUser,
    });
  } catch (error) {
    console.error("GetMe extraction error:", error);
    return res.status(500).json({ error: "Failed to resolve session." });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).json({ status: "success", message: "Logged out successfully" });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash: newPasswordHash },
    });

    return res.status(200).json({ status: "success", message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Failed to change password." });
  }
};

module.exports = { registerUser, loginUser, getMe, logoutUser, changePassword };
