// routes/noiseRoutes.js
const express = require("express");
const router = express.Router();
const Noise = require("../models/NoiseChunk"); // your updated model

router.post("/", async (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Missing 'value' in request body" });
    }

    // Optional location fallback
    const location = req.body.location || "default";

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);

    const dateStr = istDate.toISOString().slice(0, 10); // e.g. "2025-04-19"
    const weekStr = `${istDate.getFullYear()}-W${Math.ceil(
      (istDate.getDate() - 1 + istDate.getDay()) / 7
    )}`; // ISO-style week string

    const time = istDate.toISOString();

    // Find or create a document for the current date
    const doc = await Noise.findOneAndUpdate(
      { date: dateStr, location },
      {
        $push: {
          readings: {
            value,
            time,
          },
        },
        $setOnInsert: {
          location,
          week: weekStr,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Noise reading stored successfully", doc });
  } catch (error) {
    console.error("Error saving noise reading:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
