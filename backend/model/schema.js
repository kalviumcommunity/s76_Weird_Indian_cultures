const mongoose = require("mongoose");

const Itemschema = new mongoose.Schema(
  {
    CultureName: {
      type: String,
      required: true,
      trim: true,
    },
    CultureDescription: {
      type: String,
      required: true,
      trim: true,
    },
    Region: {
      type: String,
      required: true,
      trim: true,
    },
    Significance: {
      type: String,
      required: true,
      trim: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ImageURL: {
      type: String,
      default: null,
    },
    VideoURL: {
      type: String,
      default: null,
    },
    Likes: {
      type: Number,
      default: 0,
    },
    Saves: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", Itemschema);
