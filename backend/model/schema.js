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
  WeirdnessLevel: {  
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model("Item", Itemschema);
