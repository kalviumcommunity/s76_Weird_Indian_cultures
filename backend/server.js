require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const pool = require("./database"); // This is your MySQL connection pool

const cors = require("cors");
app.use(cors());
app.use(express.json());

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

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
