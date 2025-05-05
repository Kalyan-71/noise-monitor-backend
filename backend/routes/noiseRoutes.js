const express = require('express');
const router = express.Router();
const NoiseChunk = require('../models/NoiseChunk');
const moment = require("moment");

router.post("/", async (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Missing 'value' in request body" });
    }

    const location = "Default"; // Capitalized to match your example

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    
    const dateStr = istDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const hour = istDate.getHours(); // 0–23
    // const timeStr = moment(istDate).format("HH:mm:ss"); // "12:00:00"
    const isDay = hour >= 6 && hour < 18; // 6 AM to 6 PM is "day"

    // const weekStr = moment(istDate).format('GGGG-[W]WW'); // e.g., "2025-W18"

    const weekStr = `${istDate.getFullYear()}-W${Math.ceil(
            (istDate.getDate() - 1 + istDate.getDay()) / 7
          )}`; // ISO-style week string

     const time = istDate.toISOString();
    // Step 1: Push new reading
    await NoiseChunk.findOneAndUpdate(
      { date: dateStr, location },
      {
        $push: {
          readings: {
            // time: timeStr,
            time,
            value,
            isDay,
          },
        },
        $set: {
          date: dateStr,
          hour,
          week: weekStr,
          location,
        },
        // $setOnInsert: {
        //             location,
        //             week: weekStr,
        //           },
      },
      { upsert: true, new: true }
    );

    // Step 2: Fetch updated document for recalculating stats
    const updatedDoc = await NoiseChunk.findOne({ date: dateStr, location });

    if (updatedDoc && updatedDoc.readings.length > 0) {
      const values = updatedDoc.readings.map((r) => r.value);
      const avg = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
      const peak = Math.max(...values);
      const low = Math.min(...values);

      updatedDoc.avg = avg;
      updatedDoc.peak = peak;
      updatedDoc.low = low;

      await updatedDoc.save();

      return res.status(200).json({ message: "Noise reading stored successfully", doc: updatedDoc });
    }

    res.status(500).json({ error: "Failed to update document statistics" });
  } catch (error) {
    console.error("Error saving noise reading:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// GET endpoint to retrieve the latest noise reading
router.get("/latest", async (req, res) => {
  try {
    const latestNoise = await NoiseChunk.findOne()
      .sort({ "readings.time": -1 }) // Sort by the most recent reading
      .select("readings") // Select the readings array
      .limit(1); // Get only the most recent reading

    if (!latestNoise || !latestNoise.readings || latestNoise.readings.length === 0) {
      return res.status(404).json({ error: "No noise readings found" });
    }

    const latestReading = latestNoise.readings[latestNoise.readings.length - 1];

    res.status(200).json({ value: latestReading.value, time: latestReading.time });
  } catch (error) {
    console.error("Error fetching latest noise reading:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /analysis/daily - Daily noise analysis
router.get("/analysis/daily", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Missing 'date' query parameter" });
    }

    const chunks = await NoiseChunk.find({ date }).sort({ hour: 1 });

    if (!chunks.length) {
      return res.status(404).json({ error: "No data found for the given date" });
    }

    const hourlyData = [];
    let total = 0;
    let count = 0;
    let max = -Infinity;
    let min = Infinity;
    let dangerSpikes = 0;
    let totalReadings = 0;
    let safeCount = 0;

    chunks.forEach(chunk => {
      const { hour, avg, peak, low, readings } = chunk;
      hourlyData.push({ hour, avg, peak, low });

      total += avg;
      count++;
      if (peak > max) max = peak;
      if (low < min) min = low;

      readings.forEach(r => {
        totalReadings++;
        if (r.value > 85) dangerSpikes++;
        if (r.value < 70) safeCount++;
      });
    });

    const avgDay = total / count;
    const safePercent = ((safeCount / totalReadings) * 100).toFixed(2);

    res.json({
      date,
      hourlyData,
      summary: {
        average: avgDay.toFixed(2),
        peak: max,
        low: min,
        dangerSpikes,
        safePercent,
      },
    });
  } catch (err) {
    console.error("Daily analysis error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /analysis/weekly - Weekly noise analysis
router.get("/analysis/weekly", async (req, res) => {
  try {
    const { week } = req.query;

    if (!week) {
      return res.status(400).json({ error: "Missing 'week' query parameter (e.g., 2025-W18)" });
    }

    const chunks = await NoiseChunk.find({ week });

    if (!chunks || chunks.length === 0) {
      return res.status(404).json({ error: "No noise data found for the specified week." });
    }

    const dailyStats = {};
    for (const chunk of chunks) {
      if (!dailyStats[chunk.date]) {
        dailyStats[chunk.date] = {
          totalReadings: 0,
          readingCount: 0,
          max: -Infinity,
          min: Infinity,
        };
      }

      dailyStats[chunk.date].totalReadings += chunk.readings.reduce((sum, r) => sum + r.value, 0);
      dailyStats[chunk.date].readingCount += chunk.readings.length;
      dailyStats[chunk.date].max = Math.max(dailyStats[chunk.date].max, chunk.peak || 0);
      dailyStats[chunk.date].min = Math.min(dailyStats[chunk.date].min, chunk.low || Infinity);
    }

    const summary = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      average: stats.readingCount ? stats.totalReadings / stats.readingCount : 0,
      peak: stats.max,
      low: stats.min,
    }));

    res.json({ week, summary });
  } catch (error) {
    console.error("Error in weekly analysis route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /analysis/monthly - Monthly noise analysis
router.get("/analysis/monthly", async (req, res) => {
  try {
    const { month } = req.query; // Expected format: "YYYY-MM"

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: "Missing or invalid 'month' query (expected YYYY-MM)" });
    }

    const chunks = await NoiseChunk.find({
      date: { $regex: `^${month}` },
    });

    if (!chunks || chunks.length === 0) {
      return res.status(404).json({ error: "No noise data found for the specified month." });
    }

    const weeklyStats = {};
    for (const chunk of chunks) {
      const week = chunk.week || "Unknown";

      if (!weeklyStats[week]) {
        weeklyStats[week] = {
          totalReadings: 0,
          readingCount: 0,
          max: -Infinity,
          min: Infinity,
        };
      }

      weeklyStats[week].totalReadings += chunk.readings.reduce((sum, r) => sum + r.value, 0);
      weeklyStats[week].readingCount += chunk.readings.length;
      weeklyStats[week].max = Math.max(weeklyStats[week].max, chunk.peak || 0);
      weeklyStats[week].min = Math.min(weeklyStats[week].min, chunk.low || Infinity);
    }

    const summary = Object.entries(weeklyStats).map(([week, stats]) => ({
      week,
      average: stats.readingCount ? stats.totalReadings / stats.readingCount : 0,
      peak: stats.max,
      low: stats.min,
    }));

    res.json({ month, summary });
  } catch (error) {
    console.error("Error in monthly analysis route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

