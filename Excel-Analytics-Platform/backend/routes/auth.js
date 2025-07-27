const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Login Route (for all users)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(403).json({ msg: "Account is deactivated" });
    }
    const token = jwt.sign({ user: { id: user._id, role: user.role } }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: "Server error during login" });
  }
});

// Signup Route (for all users)
router.post("/signup", async (req, res) => {
  try {
    const { username, password, email, role = "user" } = req.body; // Default role to "user"
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ msg: "Username or email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, role });
    await user.save();
    const token = jwt.sign({ user: { id: user._id, role: user.role } }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: "Server error during signup" });
  }
});

// Forgot Password Route (for all users)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Email not found" });

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Click this link to reset your password: ${resetLink}`,
    });

    res.json({ msg: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to send reset email" });
  }
});

// Google OAuth Routes (for all users)
router.get("/google", (req, res) => {
  const signup = req.query.signup === "true";
  const url = client.generateAuthUrl({
    scope: ["profile", "email"],
    redirect_uri: GOOGLE_REDIRECT_URI,
    state: signup ? "signup" : "login",
  });
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { sub: googleId, email, name } = payload;
  const state = req.query.state;

  let user = await User.findOne({ googleId });
  if (!user) {
    if (state === "signup") {
      user = new User({ username: name, email, googleId, role: "user" });
      await user.save();
    } else {
      return res.status(400).json({ msg: "No account linked to this Google account. Please sign up first." });
    }
  } else if (!user.isActive) {
    return res.status(403).json({ msg: "Account is deactivated" });
  }

  const token = jwt.sign({ user: { id: user._id, role: user.role } }, JWT_SECRET, { expiresIn: "1h" });
  res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.resetToken || user.resetToken !== token || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to reset password" });
  }
});

module.exports = router;