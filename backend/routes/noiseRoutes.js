// routes/noiseRoutes.js
const express = require("express");
const router = express.Router();
const Noise = require("../models/Noise");

router.post("/noise", async (req, res) => {
  try {
    const { value } = req.body;

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const timeStr = now.toTimeString().split(" ")[0].slice(0, 5); // "HH:MM"

    const existingDoc = await Noise.findOne({ date: dateStr });

    if (existingDoc) {
      // Update by pushing to readings array
      existingDoc.readings.push({ time: timeStr, value });
      await existingDoc.save();
      res.status(200).json({ success: true, message: "Reading appended" });
    } else {
      // Create new day document
      const newDoc = new Noise({
        date: dateStr,
        readings: [{ time: timeStr, value }]
      });
      await newDoc.save();
      res.status(201).json({ success: true, message: "New day created" });
    }

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
