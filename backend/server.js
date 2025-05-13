require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT;
const pool = require("./database"); // This is your MySQL connection pool

const cors = require("cors");
app.use(cors());
app.use(express.json());

app.use(cookieParser())

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
    // console.log("DB connection successful:", rows);
  } catch (error) {
    console.error("DB check error:", error.message);
    res.status(500).send("Database connection failed");
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
