// src/pages/Dashboard.jsx
import React from "react";
import NoiseStatus from "../components/NoiseStatus";
import NoiseChart from "../components/NoiseChart";

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-3xl font-bold text-gray-800 my-6">
        ESP32 Real-Time Noise Monitor
      </h1>
      <NoiseStatus />
      <NoiseChart />
    </div>
  );
};

export default Dashboard;
