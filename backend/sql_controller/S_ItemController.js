const Joi = require("joi");
const pool = require("../database");

// Joi validation for item creation and update
const itemValidationSchema = Joi.object({
  CultureName: Joi.string().min(3).max(100).required(),
  CultureDescription: Joi.string().min(10).max(500).required(),
  Region: Joi.string().min(3).max(100).required(),
  Significance: Joi.string().min(10).max(500).required(),
  created_by: Joi.number().required(),
});

// Create a new item
const create = async (req, res) => {
  try {
    // Debug log
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { error } = itemValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { CultureName, CultureDescription, Region, Significance, created_by } = req.body;

    const imageURL = req.files?.image ? `/uploads/${req.files.image[0].filename}` : null;
    const videoURL = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;

    const [userRows] = await pool.execute("SELECT * FROM users WHERE id = ?", [created_by]);
    if (userRows.length === 0) return res.status(400).json({ message: "Invalid user ID" });

    const [result] = await pool.execute(
      `INSERT INTO Item (CultureName, CultureDescription, Region, Significance, created_by, ImageURL, VideoURL) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [CultureName, CultureDescription, Region, Significance, created_by, imageURL, videoURL]
    );

    res.status(201).json({ message: "Item created successfully!", itemId: result.insertId });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// Fetch all items
const fetch = async (req, res) => {
  try {
    const [items] = await pool.execute("SELECT * FROM Item");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch single item
const getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [itemRows] = await pool.execute("SELECT * FROM Item WHERE id = ?", [id]);
    if (itemRows.length === 0) return res.status(404).json({ message: "Item not found." });

    res.json(itemRows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update item
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = itemValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { CultureName, CultureDescription, Region, Significance, created_by } = req.body;

    const [userRows] = await pool.execute("SELECT * FROM users WHERE id = ?", [created_by]);
    if (userRows.length === 0) return res.status(400).json({ message: "Invalid user ID" });

    let imageSet = '', imageValue = null;
    if (req.files && req.files.image) {
      imageSet = ', ImageURL = ?';
      imageValue = `/uploads/${req.files.image[0].filename}`;
    }
    let videoSet = '', videoValue = null;
    if (req.files && req.files.video) {
      videoSet = ', VideoURL = ?';
      videoValue = `/uploads/${req.files.video[0].filename}`;
    }

    let query = `UPDATE Item SET CultureName = ?, CultureDescription = ?, Region = ?, Significance = ?, created_by = ?${imageSet}${videoSet} WHERE id = ?`;
    let params = [CultureName, CultureDescription, Region, Significance, created_by];
    if (imageSet) params.push(imageValue);
    if (videoSet) params.push(videoValue);
    params.push(id);

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found." });

    res.json({ message: "Item updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete item
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

// Like item
const likeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(`UPDATE Item SET Likes = Likes + 1 WHERE id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Liked!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save item
const saveItem = async (req, res) => {
  try {
    const { item_id, user_id } = req.body;
    await pool.execute("INSERT INTO Saves (item_id, user_id) VALUES (?, ?)", [item_id, user_id]);
    await pool.execute("UPDATE Item SET Saves = Saves + 1 WHERE id = ?", [item_id]);

    res.json({ message: "Item saved successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comment on item
// Comment on item
const addComment = async (req, res) => {
  try {
    const { item_id, user_id, comment } = req.body;
    if (!item_id || !user_id || !comment) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    await pool.execute(
      "INSERT INTO Comments (item_id, user_id, comment) VALUES (?, ?, ?)",
      [item_id, user_id, comment]
    );
    res.status(201).json({ message: "Comment added successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comments for item
const getComments = async (req, res) => {
  try {
    const { itemId } = req.params;
    const [comments] = await pool.execute(
      `SELECT Comments.*, users.username FROM Comments 
       JOIN users ON Comments.user_id = users.id 
       WHERE Comments.item_id = ? ORDER BY Comments.created_at DESC`,
      [itemId]
    );

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
const users = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Items created by a user
const usercreatedby = async (req, res) => {
  try {
    const { userId } = req.params;
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const [items] = await pool.execute(
      `SELECT Item.*, users.username FROM Item 
       JOIN users ON Item.created_by = users.id 
       WHERE Item.created_by = ?`,
      [userId]
    );

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create,
  fetch,
  update,
  Delete,
  getItem,
  users,
  usercreatedby,
  likeItem,
  saveItem,
  addComment,
  getComments,
};