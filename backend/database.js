const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

const getDbUri = () => {
  const rawUri = process.env.DB_URL || process.env.MONGO_URI || "";
  return rawUri.trim().replace(/^['"]|['"]$/g, "");
};

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const uri = getDbUri();
  if (!uri) {
    throw new Error(
      "MongoDB connection string is missing. Set DB_URL or MONGO_URI in your environment."
    );
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB_NAME || undefined,
    });
    isConnected = true;
    console.log("✅ MongoDB connection established");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
