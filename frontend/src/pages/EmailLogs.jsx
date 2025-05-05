import React, { useState, useEffect } from "react";
import axios from "axios";

const EmailLogs = () => {
  const [emailLogs, setEmailLogs] = useState([]);

  // Fetch email logs from the server
  useEffect(() => {
    const fetchEmailLogs = async () => {
      try {
        const response = await axios.get("/api/noise/email-logs");
        setEmailLogs(response.data);
      } catch (error) {
        console.error("Error fetching email logs:", error.message);
      }
    };

    fetchEmailLogs();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Email Logs</h1>
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border-b px-4 py-2 text-left">Timestamp</th>
            <th className="border-b px-4 py-2 text-left">Noise Level (dB)</th>
            <th className="border-b px-4 py-2 text-left">Message</th>
          </tr>
        </thead>
        <tbody>
          {emailLogs.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-4">No logs available.</td>
            </tr>
          ) : (
            emailLogs.map((log) => (
              <tr key={log._id}>
                <td className="border-b px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="border-b px-4 py-2">{log.dbLevel} dB</td>
                <td className="border-b px-4 py-2">{log.message}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmailLogs;
