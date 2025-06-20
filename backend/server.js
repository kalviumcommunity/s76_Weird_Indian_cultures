require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;
const pool = require("./database");
const cors = require("cors");

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // <-- Your frontend's URL and port
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('public/uploads')); // Serve uploads statically

// Routes
app.use("/api/item", require("./routes"));

// Ping route
app.get("/ping", (req, res) => {
  res.send("Pong!");
});

// Health check route to verify DB connection
app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.send("Database connection is working!");
  } catch (error) {
    console.error("DB check error:", error.message);
    res.status(500).send("Database connection failed");
  }
});

// Multer error handler for better error messages
app.use((err, req, res, next) => {
  if (err instanceof require('multer').MulterError || err.message.includes("Only image/video files")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});