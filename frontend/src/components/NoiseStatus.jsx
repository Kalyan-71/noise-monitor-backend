import React, { useState, useEffect } from "react";
import axios from "axios";

const NoiseStatus = () => {
  const [dB, setDb] = useState(null);

  // Function to set background color based on noise level
  const getClassName = () => {
    if (dB < 70) return "bg-green-600"; // Safe
    if (dB < 85) return "bg-orange-500"; // Moderate
    return "bg-red-600"; // Dangerous
  };

  useEffect(() => {
    // Fetch noise data every second
    const fetchNoise = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/noise/latest");
        setDb(parseInt(res.data.value)); // Set the fetched noise value
      } catch (err) {
        console.error("Error fetching:", err);
      }
    };

    // Fetch data every 1 second
    const interval = setInterval(fetchNoise, 1000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div
      className={`text-white text-xl font-semibold px-6 py-3 rounded-xl my-4 ${getClassName()}`}
    >
      Noise Level: {dB !== null ? `${dB} dB` : "Loading..."} {/* Display noise level */}
    </div>
  );
};

export default NoiseStatus;
