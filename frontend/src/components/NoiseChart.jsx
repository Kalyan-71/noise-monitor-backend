import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const NoiseChart = () => {
  const [labels, setLabels] = useState([]); // Store time-based labels
  const [dataPoints, setDataPoints] = useState([]); // Store noise level data points
  const [counter, setCounter] = useState(0); // To increment the time on the X-axis
  const chartRef = useRef(null); // Reference to the chart

  const maxPoints = 100; // Limit chart data to 100 points

  const fetchNoise = async () => {
    try {
      const res = await axios.get("https://noise-backend.onrender.com/api/noise/latest");
      const dB = parseInt(res.data.value); // Get the noise value from response

      // Update labels (time-based)
      setLabels((prev) => {
        const updated = [...prev, counter];
        if (updated.length > maxPoints) updated.shift(); // Remove excess data points
        return updated;
      });

      // Update data points (noise levels)
      setDataPoints((prev) => {
        const updated = [...prev, dB];
        if (updated.length > maxPoints) updated.shift(); // Remove excess data points
        return updated;
      });

      setCounter((prev) => prev + 1); // Increment counter for time-based labeling
    } catch (err) {
      console.error("Error fetching noise data:", err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(fetchNoise, 1000); // Fetch data every 1 second
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Function to get line color based on noise level
  const getLineColor = () => {
    const last = dataPoints[dataPoints.length - 1] || 0;
    return last < 70 ? "green" : last < 85 ? "orange" : "red"; // Color based on noise level
  };

  // Chart data structure
  const chartData = {
    labels,
    datasets: [
      {
        label: "Noise Level (dB SPL)",
        data: dataPoints,
        borderColor: getLineColor(),
        backgroundColor: getLineColor(),
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  // Chart options for customization
  const chartOptions = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (s)",
        },
      },
      y: {
        beginAtZero: true,
        max: 120,
        title: {
          display: true,
          text: "Noise Level (dB)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Line ref={chartRef} data={chartData} options={chartOptions} />
    </div>
  );
};

export default NoiseChart;