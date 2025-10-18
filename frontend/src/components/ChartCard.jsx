import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ChartCard({ title, data }) {
  return (
    <div className="card p-3 h-100">
      <h6 className="fw-bold mb-3">{title}</h6>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="date" stroke="#555" />
          <YAxis stroke="#555" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="collected" stroke="#34A853" strokeWidth={2} />
          <Line type="monotone" dataKey="efficiency" stroke="#673AB7" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
