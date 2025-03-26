const Joi = require("joi");
const Itemschema = require("../model/schema.js");

// ✅ Joi Schema for Validation
const itemValidationSchema = Joi.object({
  CultureName: Joi.string().min(3).max(100).required(),
  CultureDescription: Joi.string().min(10).max(500).required(),
  Region: Joi.string().min(3).max(100).required(),
  Significance: Joi.string().min(10).max(500).required(),
});

// 🔹 Create a new item with Joi validation
const create = async (req, res) => {
  try {
    // Validate request body
    const { error } = itemValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Save item in DB
    const item = new Itemschema(req.body);
    await item.save();

    res.status(201).json({ message: "Item created successfully!", item });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 🔹 Fetch all items
const fetch = async (req, res) => {
  try {
    const items = await Itemschema.find({});
    if (items.length === 0) {
      return res.status(404).json({ message: "No items found." });
    }
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 🔹 Fetch a single item by ID with Joi validation
const getItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const item = await Itemschema.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 🔹 Update an item with Joi validation
const update = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Validate request body
    const { error } = itemValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedItem = await Itemschema.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json({ message: "Item updated successfully!", updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 🔹 Delete an item with Joi validation
const Delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const item = await Itemschema.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json({ message: "Item deleted successfully!" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { create, fetch, update, Delete, getItem };
