const express = require('express');
const router = express.Router();
const NoiseChunk = require('../models/NoiseChunk');
const moment = require("moment");

router.post("/", async (req, res) => {
  try {
    // const { value } = req.body;
    const { value, location = 'Default' } = req.body; // Default to 'Default' if location is not provided

    if (value === undefined) {
      return res.status(400).json({ error: "Missing 'value' in request body" });
    }

    // const location = "Default"; // Capitalized to match your example

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    
    const dateStr = istDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const hour = istDate.getHours(); // 0–23
    
    const isDay = hour >= 6 && hour < 18; // 6 AM to 6 PM is "day"

    const weekStr = moment(istDate).format('GGGG-[W]WW'); // e.g., "2025-W18"



     const time = istDate.toISOString();
    // Step 1: Push new reading
    await NoiseChunk.findOneAndUpdate(
      { date: dateStr,hour, location },
      {
        $push: {
          readings: {
            
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
    const latestNoise = await NoiseChunk.aggregate([
      { $unwind: "$readings" },
      { $sort: { "readings.time": -1 } },
      { $limit: 1 },
      { $project: { value: "$readings.value", time: "$readings.time" } }
    ]);

    if (!latestNoise || latestNoise.length === 0) {
      return res.status(404).json({ error: "No noise readings found" });
    }

    const latestReading = latestNoise[0]; // Use the first result

    res.status(200).json({ value: latestReading.value, time: latestReading.time });
  } catch (error) {
    console.error("Error fetching latest noise reading:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /api/noise/:timeRange?zone=Default
router.get('/:timeRange', async (req, res) => {
  try {
    const { timeRange } = req.params;
    const zone = req.query.zone || 'Default';

    const now = moment().utcOffset("+05:30"); // India time

    let matchQuery = { location: zone };

    if (timeRange === 'daily') {
      const today = now.format('YYYY-MM-DD');
      matchQuery.date = today;
    } else if (timeRange === 'weekly') {
      const weekStr = now.format('GGGG-[W]WW'); // e.g., "2025-W18"
      matchQuery.week = weekStr;
    } else if (timeRange === 'monthly') {
      const month = now.format('YYYY-MM'); // e.g., "2025-05"
      matchQuery.date = { $regex: `^${month}` };
    } else {
      return res.status(400).json({ error: 'Invalid timeRange' });
    }

    const chunks = await NoiseChunk.find(matchQuery).sort({ hour: 1 });

    const data = [];
    let totalAvgSum = 0;
    let totalDangerSpikes = 0;
    let totalSafePercent = 0;
    let maxLongestSpike = 0;

    for (const chunk of chunks) {
      const readings = chunk.readings;
      const values = readings.map((r) => r.value);

      const avg = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
      const peak = Math.max(...values);
      const low = Math.min(...values);

      const dangerSpikes = readings.filter(r => r.value > 85).length;

      let longestSpike = 0;
      let currentSpike = 0;
      readings.forEach((r) => {
        if (r.value > 85) {
          currentSpike++;
          longestSpike = Math.max(longestSpike, currentSpike);
        } else {
          currentSpike = 0;
        }
      });

      const safeTime = readings.filter(r => r.value < 60).length;
      const safeTimePercent = (safeTime / readings.length) * 100;

      // Accumulate summary stats
      totalAvgSum += avg;
      totalDangerSpikes += dangerSpikes;
      totalSafePercent += safeTimePercent;
      maxLongestSpike = Math.max(maxLongestSpike, longestSpike);

      data.push({
        hour: chunk.hour,
        avg,
        peak,
        low,
        dangerSpikes,
        longestSpike,
        safeTimePercent,
        date: chunk.date,
      });
    }

    const totalChunks = data.length || 1; // avoid divide-by-zero
    const summaryStats = {
      avgDb: parseFloat((totalAvgSum / totalChunks).toFixed(2)),
      dangerSpikes: totalDangerSpikes,
      longestSpikeMin: maxLongestSpike,
      safePercentage: parseFloat((totalSafePercent / totalChunks).toFixed(1)),
    };

    return res.status(200).json({
      timeRange,
      zone,
      data,
      summaryStats,
    });

  } catch (err) {
    console.error('Error in analysis endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});






module.exports = router;

