import { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';

import NoiseLineChart from '../components/NoiseLineChart';
import NoiseBarChart from '../components/NoiseBarChart';

export default function AnalysisPage() {
  const [timeRange, setTimeRange] = useState('daily');
  const [noiseStats, setNoiseStats] = useState(null);
  const [zone, setZone] = useState('Default'); 
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/noise/${timeRange}?zone=${zone}`);
  
        // Separate hourly data and summary stats
        const { data, summaryStats } = res.data;
  
        setChartData(data);         // used for charts
        setNoiseStats(summaryStats); // used for the summary cards
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
  
    fetchData();
  }, [timeRange, zone]);
  

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 50),
  };

  const monthlyData = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    values: Array.from({ length: 30 }, () => Math.floor(Math.random() * 40) + 50),
  };

  const simulatedChartData = (() => {
    if (timeRange === 'daily') return chartData;
    const source = timeRange === 'weekly' ? weeklyData : monthlyData;
    return source.labels.map((label, index) => ({
      time: label,
      db: source.values[index],
      zone: zone !== 'All' ? zone : 'Unknown', // Using the selected zone
    }));
  })();




  

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Noise Analysis Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Time Range: ${timeRange}`, 20, 30);
    doc.text(`Zone: ${zone}`, 20, 40);
    doc.text(`Data: ${JSON.stringify(simulatedChartData)}`, 20, 50);
    doc.save('noise_analysis_report.pdf');
  };

  const exportCSV = () => {
    const csvData = simulatedChartData.map((item) => ({
      time: item.time,
      db: item.db,
    }));
    const csv = Papa.unparse(csvData);
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.target = '_blank';
    link.download = 'noise_analysis_report.csv';
    link.click();
  };

 

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Noise Analysis</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white shadow p-4 rounded-lg">
          <p className="text-sm text-gray-500">Avg Noise</p>
          <p className="text-xl font-semibold text-blue-600">{noiseStats?.avgDb ?? '--'} dB</p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <p className="text-sm text-gray-500">Danger Spikes</p>
          <p className="text-xl font-semibold text-red-500">{noiseStats?.dangerSpikes ?? '--'}</p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <p className="text-sm text-gray-500">Longest Spike</p>
          <p className="text-xl font-semibold text-yellow-600">{noiseStats?.longestSpikeMin ?? '--'} min</p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <p className="text-sm text-gray-500">Safe Time %</p>
          <p className="text-xl font-semibold text-green-500">{noiseStats?.safePercentage ?? '--'}%</p>
        </div>
      </div>


<div className="flex flex-wrap items-center gap-4 my-4">
  {/* Time Range Dropdown */}
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700">Time Range</label>
    <select
      value={timeRange}
      onChange={(e) => setTimeRange(e.target.value)}
      className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
    </select>
  </div>

  {/* Zone Dropdown */}
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700">Zone</label>
    <select
      value={zone}
      onChange={(e) => setZone(e.target.value)}
      className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      <option value="All">All Zones</option>
      <option value="Default">Default</option>
      <option value="ICU">ICU</option>
      <option value="OPD">OPD</option>
      <option value="ER">ER</option>
    </select>
  </div>
</div>


      <NoiseLineChart data={chartData} />
<NoiseBarChart data={chartData} />


      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="text-lg font-semibold mb-2">Alert Timeline</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>🕒 10:42 AM - 89 dB in ICU</li>
            <li>🕒 2:10 PM - 92 dB in OPD</li>
            <li>🕒 6:50 PM - 87 dB in ER</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="text-lg font-semibold mb-2">Insights</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>🔎 ICU shows spikes post visiting hours.</li>
            <li>🔎 OPD has consistent noise between 1–3 PM.</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <button onClick={exportPDF} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Export PDF
        </button>
        <button onClick={exportCSV} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
          Download CSV
        </button>
      </div>
    </div>
  );
}
