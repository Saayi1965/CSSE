import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ReportChart({ summary }) {
  return (
    <div className="card p-3 mb-4 shadow-sm">
      <h6 className="fw-bold mb-3">Performance Visualization</h6>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={summary}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#34A853" name="Performance" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
