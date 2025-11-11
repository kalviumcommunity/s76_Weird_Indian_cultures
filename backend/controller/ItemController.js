const Joi = require("joi");
const mongoose = require("mongoose");
const Item = require("../model/schema");
const User = require("../model/User");
const Comment = require("../model/Comment");

const objectIdValidator = Joi.string()
  .trim()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }, "ObjectId validation")
  .messages({ "any.invalid": "Invalid ID format" });

const itemValidationSchema = Joi.object({
  CultureName: Joi.string().min(3).max(100).required(),
  CultureDescription: Joi.string().min(10).max(500).required(),
  Region: Joi.string().min(3).max(100).required(),
  Significance: Joi.string().min(10).max(500).required(),
  created_by: objectIdValidator.required(),
});

const updateValidationSchema = itemValidationSchema.fork("created_by", (schema) =>
  schema.optional()
);

const formatItem = (item) => ({
  id: item._id.toString(),
  CultureName: item.CultureName,
  CultureDescription: item.CultureDescription,
  Region: item.Region,
  Significance: item.Significance,
  ImageURL: item.ImageURL,
  VideoURL: item.VideoURL,
  Likes: item.Likes ?? 0,
  Saves: item.Saves ?? 0,
  created_by: item.created_by?.toString() ?? null,
});

const formatComment = (comment) => ({
  id: comment._id.toString(),
  comment: comment.comment,
  username: comment.user?.username ?? "Anonymous",
});

const validateObjectIdParam = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid ID" });
    return false;
  }
  return true;
};

const sanitizeId = (value) =>
  typeof value === "string" ? value.trim() : value;

// Create a new item
const create = async (req, res) => {
  try {
    const payload = {
      CultureName: req.body.CultureName,
      CultureDescription: req.body.CultureDescription,
      Region: req.body.Region,
      Significance: req.body.Significance,
      created_by: sanitizeId(req.body.created_by),
    };

    const { error, value } = itemValidationSchema.validate(payload);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const creator = await User.findById(value.created_by);
    if (!creator) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const imageURL = req.files?.image ? `/uploads/${req.files.image[0].filename}` : null;
    const videoURL = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;

    const item = await Item.create({
      ...value,
      ImageURL: imageURL,
      VideoURL: videoURL,
    });

    res.status(201).json({ message: "Item created successfully!", item: formatItem(item) });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Fetch all items
const fetch = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items.map(formatItem));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch single item
const getItem = async (req, res) => {
  try {
    const id = sanitizeId(req.params.id);
    if (!validateObjectIdParam(id, res)) return;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json(formatItem(item));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update item
const update = async (req, res) => {
  try {
    const id = sanitizeId(req.params.id);
    if (!validateObjectIdParam(id, res)) return;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    const bodyCreatorId = sanitizeId(req.body.created_by);
    const creatorId = req.user?.id || bodyCreatorId || item.created_by.toString();
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const payload = {
      CultureName: req.body.CultureName,
      CultureDescription: req.body.CultureDescription,
      Region: req.body.Region,
      Significance: req.body.Significance,
      created_by: creatorId,
    };

    const { error, value } = updateValidationSchema.validate(payload);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const creator = await User.findById(value.created_by);
    if (!creator) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    item.CultureName = value.CultureName;
    item.CultureDescription = value.CultureDescription;
    item.Region = value.Region;
    item.Significance = value.Significance;
    item.created_by = value.created_by;

    if (req.files?.image) {
      item.ImageURL = `/uploads/${req.files.image[0].filename}`;
    }

    if (req.files?.video) {
      item.VideoURL = `/uploads/${req.files.video[0].filename}`;
    }

    await item.save();

    res.json({ message: "Item updated successfully!", item: formatItem(item) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete item
const Delete = async (req, res) => {
  try {
    const id = sanitizeId(req.params.id);
    if (!validateObjectIdParam(id, res)) return;

    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found." });
    }

    await Comment.deleteMany({ item: id });

    res.json({ message: "Item deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like item
const likeItem = async (req, res) => {
  try {
    const id = sanitizeId(req.params.id);
    if (!validateObjectIdParam(id, res)) return;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const userId = req.user?.id;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const alreadyLiked = item.likedBy.some((likedId) => likedId.toString() === userId);
      if (alreadyLiked) {
        return res.json({ message: "Already liked" });
      }
      item.likedBy.push(userId);
      item.Likes = item.likedBy.length;
    } else {
      item.Likes = (item.Likes || 0) + 1;
    }

    await item.save();

    res.json({ message: "Liked!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save item
const saveItem = async (req, res) => {
  try {
    const itemId = sanitizeId(req.body.item_id);
    const userId = req.user?.id || sanitizeId(req.body.user_id);

    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required." });
    }
    if (!validateObjectIdParam(itemId, res)) return;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid user ID is required." });
    }

    const [item, user] = await Promise.all([
      Item.findById(itemId),
      User.findById(userId),
    ]);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const alreadySaved = item.savedBy.some((savedId) => savedId.toString() === userId);
    if (alreadySaved) {
      return res.json({ message: "Item already saved." });
    }

    item.savedBy.push(userId);
    item.Saves = item.savedBy.length;
    await item.save();

    res.json({ message: "Item saved successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comment on item
const addComment = async (req, res) => {
  try {
    const itemId = sanitizeId(req.body.item_id);
    const userId = sanitizeId(req.body.user_id);
    const { comment } = req.body;
    if (!itemId || !userId || typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid item or user ID." });
    }

    const [item, user] = await Promise.all([
      Item.findById(itemId),
      User.findById(userId),
    ]);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const newComment = await Comment.create({
      item: itemId,
      user: userId,
      comment: comment.trim(),
    });

    await newComment.populate("user", "username");

    res.status(201).json({
      message: "Comment added successfully!",
      comment: formatComment(newComment),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comments for item
const getComments = async (req, res) => {
  try {
    const itemId = sanitizeId(req.params.itemId);
    if (!validateObjectIdParam(itemId, res)) return;

    const comments = await Comment.find({ item: itemId })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json(comments.map(formatComment));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
const users = async (req, res) => {
  try {
    const allUsers = await User.find().select("username").sort({ username: 1 });
    res.json(
      allUsers.map((user) => ({
        id: user._id.toString(),
        username: user.username,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Items created by a user
const usercreatedby = async (req, res) => {
  try {
    const userId = sanitizeId(req.params.userId);
    if (!validateObjectIdParam(userId, res)) return;

    const items = await Item.find({ created_by: userId }).sort({ createdAt: -1 });
    res.json(items.map(formatItem));
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
