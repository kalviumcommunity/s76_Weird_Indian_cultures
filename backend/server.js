require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./database");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('public/uploads')); // Serve uploads statically

// Routes
app.use("/api/item", require("./routes"));

// Ping route
app.get("/ping", (req, res) => {
  res.send("Pong!");
});

// Health check route to verify server is up
app.get("/", (req, res) => {
  res.send("API is running");
});

// Multer error handler for better error messages
app.use((err, req, res, next) => {
  if (err instanceof require('multer').MulterError || err.message.includes("Only image/video files")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Connect to DB first, then start the server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`✅ Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
