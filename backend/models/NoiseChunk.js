const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
  time: String,      // "14:03:01"
  value: Number,
  isDay: Boolean
}, { _id: false });

const chunkSchema = new mongoose.Schema({
  date: {
    type: String,     // "YYYY-MM-DD"
    required: true
  },
  hour: {
    type: String,     // "HH"
    required: true
  },
  location: {
    type: String,
    default: "Default"
  },
  week: {
    type: String // Format: "2025-W18"
  },

  readings: [readingSchema],
  avg: Number,
  peak: Number,
  low: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicates per hour
chunkSchema.index({ date: 1, hour: 1, location: 1 }, { unique: true });

module.exports = mongoose.model("NoiseChunk", chunkSchema);
