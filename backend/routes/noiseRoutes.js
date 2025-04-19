// routes/noiseRoutes.js
const express = require("express");
const router = express.Router();
const Noise = require("../models/Noise");

router.post("/noise", async (req, res) => {
  try {
    const { value } = req.body;
    const noise = new Noise({ value });
    await noise.save();
    res.status(201).json({ success: true, data: noise });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
