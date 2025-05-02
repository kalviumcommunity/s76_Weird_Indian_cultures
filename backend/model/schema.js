const mongoose = require("mongoose");

const Itemschema = new mongoose.Schema({
  CultureName: {
    type: String,
    required: true,
  },
  CultureDescription: {
    type: String,
    required: true,
  },
  Region: {
    type: String,
    required: true,
  },
  Significance: {
    type: String,
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    // required: true,
  }
});

module.exports = mongoose.model("Item", Itemschema);
