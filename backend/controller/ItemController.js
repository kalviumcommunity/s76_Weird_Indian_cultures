const Itemschema = require('../model/schema.js');

// 🔹 Create a new item
const create = async (req, res) => {
  try {
    const { CultureName, CultureDescription, Region, Significance } = req.body;

    // Validate required fields
    if (!CultureName || !CultureDescription || !Region || !Significance) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create and save the item
    const item = new Itemschema({ CultureName, CultureDescription, Region, Significance });
    await item.save();

    res.status(201).json({ message: "Item created successfully!", item });
  } catch (error) {
    console.error("Error creating item:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
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

// 🔹 Fetch a single item by ID
const getItem = async (req, res) => {
  try {
    const {id} = req.params.id;
    console.log("Fetching item with ID:", id);

    if (!id) {
      console.log("No ID provided");
      return res.status(400).json({ message: "ID is required" });
    }

    const item = await Itemschema.findById(id);
    if (!item) {
      console.log("Item not found for ID:", id);
      return res.status(404).json({ message: "Item not found." });
    }

    res.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// 🔹 Update an item
const update = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the item exists
    const item = await Itemschema.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Update the item
    const updatedItem = await Itemschema.findByIdAndUpdate(id, req.body, { new: true });

    res.json({ message: "Item updated successfully!", updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 🔹 Delete an item
const Delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Delete the item
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

module.exports = { create, fetch, update, Delete ,getItem};
