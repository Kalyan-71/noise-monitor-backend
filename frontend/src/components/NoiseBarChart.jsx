import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function NoiseBarChart({ data }) {
  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Noise Level Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
