const Joi = require("joi");
const pool = require("../database"); // Assuming a db.js file exports the mysql2 pool

// ✅ Joi Schema for Validation
const itemValidationSchema = Joi.object({
  CultureName: Joi.string().min(3).max(100).required(),
  CultureDescription: Joi.string().min(10).max(500).required(),
  Region: Joi.string().min(3).max(100).required(),
  Significance: Joi.string().min(10).max(500).required(),
  created_by: Joi.number().required(),
});

// 🔹 Create a new item
const create = async (req, res) => {
  try {
    const { error } = itemValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { CultureName, CultureDescription, Region, Significance, created_by } = req.body;

    // Validate created_by exists in the users table
    const [user] = await pool.execute("SELECT * FROM users WHERE id = ?", [created_by]);
    if (user.length === 0) return res.status(400).json({ message: "Invalid user ID" });

    const [result] = await pool.execute(
      `INSERT INTO Item (CultureName, CultureDescription, Region, Significance, created_by) VALUES (?, ?, ?, ?, ?)`,
      [CultureName, CultureDescription, Region, Significance, created_by]
    );

    res.status(201).json({ message: "Item created successfully!", itemId: result.insertId });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 🔹 Fetch all items
const fetch = async (req, res) => {
  try {
    const [items] = await pool.execute("SELECT * FROM Item");
    if (items.length === 0) return res.status(404).json({ message: "No items found." });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Fetch single item
const getItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [item] = await pool.execute("SELECT * FROM Item WHERE id = ?", [id]);
    if (item.length === 0) return res.status(404).json({ message: "Item not found." });

    res.json(item[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Update item
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = itemValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { CultureName, CultureDescription, Region, Significance, created_by } = req.body;

    // Validate created_by exists in the users table
    const [user] = await pool.execute("SELECT * FROM users WHERE id = ?", [created_by]);
    if (user.length === 0) return res.status(400).json({ message: "Invalid user ID" });

    const [result] = await pool.execute(
      `UPDATE Item SET CultureName = ?, CultureDescription = ?, Region = ?, Significance = ?, created_by = ? WHERE id = ?`,
      [CultureName, CultureDescription, Region, Significance, created_by, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found." });

    res.json({ message: "Item updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Delete item
const Delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM Item WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found." });

    res.json({ message: "Item deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get all users
const users = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM users");
    res.json(rows); // Make sure the response includes the necessary fields (_id and username)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get items by user
const usercreatedby = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId parameter
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const [items] = await pool.execute(
      `SELECT Item.*, users.username FROM Item JOIN users ON Item.created_by = users.id WHERE Item.created_by = ?`,
      [userId]
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, fetch, update, Delete, getItem, users, usercreatedby };
