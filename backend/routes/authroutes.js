const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); 
const dotenv = require("dotenv");
const authenticateToken = require("../middleware/authmiddleware"); 

dotenv.config();

const router = express.Router();


router.post("/register", async (req, res) => {
  const { name, email, mobile, password, confirmPassword } = req.body;

  try {
    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, mobile, password: hashedPassword });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token, user: { name, email, mobile } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.stack });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { name: user.name, email: user.email, mobile: user.mobile } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.stack });
  }
});


router.put("/update", authenticateToken, async (req, res) => {
  const { name, email, mobile } = req.body;

  try {
  
    const user = await User.findById(req.user.userId); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;
    user.mobile = mobile || user.mobile;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.stack });
  }
});


module.exports = router;