import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
  } from 'recharts';
  
  // Mock data for the Bar Graph
  const noiseData = [
    { zone: 'ICU', safe: 70, warning: 20, danger: 10 },
    { zone: 'OPD', safe: 60, warning: 25, danger: 15 },
    { zone: 'ER', safe: 50, warning: 30, danger: 20 }
  ];
  
  export default function NoiseBarChart() {
    return (
      <div className="bg-white shadow p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Noise Level Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={noiseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="zone" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="safe" stackId="a" fill="#34D399" />
            <Bar dataKey="warning" stackId="a" fill="#FBBF24" />
            <Bar dataKey="danger" stackId="a" fill="#F87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  