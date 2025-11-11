const jwt = require("jsonwebtoken");
const User = require("../model/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "7d";

const buildTokenPayload = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
});

// Signup Route
const signup = async (req, res) => {
  const { username, email, password } = req.body;

  const normalizedEmail =
    typeof email === "string" ? email.toLowerCase().trim() : "";

  if (!username || !normalizedEmail || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const newUser = new User({ username, email: normalizedEmail, password });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser._id.toString(), username: newUser.username },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail =
    typeof email === "string" ? email.toLowerCase().trim() : "";

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(buildTokenPayload(user), JWT_SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id.toString(), username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { signup, login, logout };
