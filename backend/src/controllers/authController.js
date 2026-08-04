// backend/src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

// Initialize Prisma
const prisma = new PrismaClient();

// Helper to determine if the account still requires initial profile onboarding setup
const attachNeedsSetup = (rawUser, safeUser) => {
  if (!safeUser || !rawUser) return;
  if (safeUser.role === "admin") {
    safeUser.needsSetup = false;
    return;
  }
  const defaultPrefix = rawUser.email ? rawUser.email.split("@")[0] : "";
  const isDefaultPhone = !rawUser.phone || rawUser.phone === "0000000000";
  const isDefaultName = !rawUser.name || rawUser.name === defaultPrefix || rawUser.name === "New User";
  
  if (safeUser.role === "merchant" || safeUser.role === "vendor") {
    const isDefaultMomo = !rawUser.momoNumber || rawUser.momoNumber === "0000000000";
    safeUser.needsSetup = isDefaultPhone || isDefaultMomo || isDefaultName || !rawUser.storeAddress;
  } else {
    safeUser.needsSetup = isDefaultPhone || isDefaultName || !rawUser.deliveryAddress;
  }
};

const registerUser = async (req, res) => {
  try {
    const { email, phone, password, name, momo_number, role, delivery_address, store_address } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const fallbackPrefix = email.split("@")[0] || "New User";

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        phone: phone || "0000000000",
        passwordHash: passwordHash,
        name: name || fallbackPrefix,
        role: (role?.toUpperCase() === "MERCHANT" || role?.toUpperCase() === "VENDOR") ? "VENDOR" : (role?.toUpperCase() === "ADMIN" ? "ADMIN" : "CONSUMER"),
        momoNumber: momo_number || (role === "MERCHANT" || role === "VENDOR" ? "0000000000" : null),
        deliveryAddress: delivery_address || null,
        storeAddress: store_address || null,
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
    safeUser.role = newUser.role?.toUpperCase() === "ADMIN" ? "admin" : (newUser.role?.toUpperCase() === "MERCHANT" || newUser.role?.toUpperCase() === "VENDOR") ? "merchant" : "customer";
    attachNeedsSetup(newUser, safeUser);

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
      where: { email: email.toLowerCase() },
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

    const isVendor = user.role?.toUpperCase() === "MERCHANT" || 
                     user.role?.toUpperCase() === "VENDOR" || 
                     (user.email && (user.email.toLowerCase().includes("vendor") || user.email.toLowerCase().includes("merchant"))) || 
                     (user.name && (user.name.toLowerCase().includes("vendor") || user.name.toLowerCase().includes("merchant")));

    if (isVendor && !['merchant', 'MERCHANT', 'vendor', 'VENDOR'].includes(user.role)) {
      await prisma.user.update({ where: { id: user.id }, data: { role: "VENDOR" } }).catch(e => console.error("Auto-heal failed:", e));
    }

    const { passwordHash: _, ...safeUser } = user;
    safeUser.role = user.role?.toUpperCase() === "ADMIN" ? "admin" : isVendor ? "merchant" : "customer";
    attachNeedsSetup(user, safeUser);

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
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User profile no longer exists." });
    }

    const isVendor = user.role?.toUpperCase() === "MERCHANT" || 
                     user.role?.toUpperCase() === "VENDOR" || 
                     (user.email && (user.email.toLowerCase().includes("vendor") || user.email.toLowerCase().includes("merchant"))) || 
                     (user.name && (user.name.toLowerCase().includes("vendor") || user.name.toLowerCase().includes("merchant")));

    if (isVendor && !['merchant', 'MERCHANT', 'vendor', 'VENDOR'].includes(user.role)) {
      await prisma.user.update({ where: { id: user.id }, data: { role: "merchant" } }).catch(e => console.error("Auto-heal failed:", e));
    }

    const { passwordHash: _, ...safeUser } = user;
    safeUser.role = user.role?.toUpperCase() === "ADMIN" ? "admin" : isVendor ? "merchant" : "customer";
    attachNeedsSetup(user, safeUser);

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
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // If user not found, return generic 200 response to prevent email enumeration
    if (!user) {
      return res.status(200).json({ message: "If an account exists with that email, a reset code has been sent." });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpires: expires,
      },
    });

    // CRITICAL MOCK LOGIC: In development environment, simulate email in response
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
      return res.status(200).json({
        message: "MOCK MODE: Email simulated",
        mock_email_content: `Your BediDwa password reset code is: ${otp}`,
        otp_for_dev: otp,
      });
    }

    return res.status(200).json({ message: "If an account exists with that email, a reset code has been sent." });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ error: "Failed to process forgot password request." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP code, and new password are all required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP reset code. Please request a new code." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: passwordHash,
        resetOtp: null,
        resetOtpExpires: null,
      },
    });

    return res.status(200).json({ status: "success", message: "Password reset successfully!" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ error: "Failed to reset password." });
  }
};

module.exports = { registerUser, loginUser, getMe, logoutUser, changePassword, forgotPassword, resetPassword };

