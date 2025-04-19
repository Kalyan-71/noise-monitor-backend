// models/Noise.js
const mongoose = require("mongoose");

const noiseSchema = new mongoose.Schema({
  value: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Noise", noiseSchema);

