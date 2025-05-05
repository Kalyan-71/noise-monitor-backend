const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();



const noiseRoutes = require("./routes/noiseRoutes");
// const analysisRoutes = require('./routes/analysisRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use('/api/analysis', analysisRoutes);

// Routes
app.use("/api/noise", noiseRoutes);

// Connect DB & Start Server
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "noise-monitor",
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("✅ Server running on port", process.env.PORT);
    });
  })
  .catch((err) => console.log("❌ MongoDB connection error:", err));
