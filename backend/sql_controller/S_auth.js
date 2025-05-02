const bcrypt = require("bcrypt");
const pool = require("../database");

// 🔹 Signup Route
const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Login Route
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
    });
    res.cookie("username", user.name, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const logout = async (req, res) => {
  res.clearcookie("username");
  res.status(200).json({ message: "Logged out Successfully" });
};
module.exports = { signup, login, logout };