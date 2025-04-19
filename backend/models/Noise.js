// models/Noise.js
const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
  time: String,     // e.g., "14:30"
  value: Number     // sound level from sensor
}, { _id: false });

const noiseSchema = new mongoose.Schema({
  date: {
    type: String,   // e.g., "2025-04-19"
    required: true,
    unique: true
  },
  readings: [readingSchema]
});

module.exports = mongoose.model("Noise", noiseSchema);
