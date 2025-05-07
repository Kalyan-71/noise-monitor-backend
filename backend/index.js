const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const noiseRoutes = require("./routes/noiseRoutes");
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
// app.use(cors());
app.use(cors({
  // origin: 'http://localhost:3000', // your React frontend origin
  origin: 'https://noise-monitor-frontend.onrender.com',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

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
