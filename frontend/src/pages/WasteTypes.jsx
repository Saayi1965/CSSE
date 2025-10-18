import React, { useEffect, useState } from "react";
import KPICard from "../components/KPICard";
import WasteTypeTable from "../components/WasteTypeTable";
import InsightCard from "../components/InsightCard";
import AlertBar from "../components/AlertBar";
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import illustration from "../assets/recycle-illustration.png";

export default function WasteTypes() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const mock = {
      wasteDistribution: [
        { name: "Organic", value: 45 },
        { name: "Plastic", value: 25 },
        { name: "Paper", value: 15 },
        { name: "Metal", value: 10 },
        { name: "E-waste", value: 5 },
      ],
      trend: [
        { month: "Jan", recyclable: 420, nonRecyclable: 280 },
        { month: "Feb", recyclable: 480, nonRecyclable: 260 },
        { month: "Mar", recyclable: 460, nonRecyclable: 310 },
        { month: "Apr", recyclable: 520, nonRecyclable: 290 },
      ],
      table: [
        { type: "Organic", collected: 1420, recycled: 880, rate: 62 },
        { type: "Plastic", collected: 980, recycled: 720, rate: 73 },
        { type: "Paper", collected: 640, recycled: 540, rate: 84 },
        { type: "Metal", collected: 420, recycled: 320, rate: 76 },
        { type: "E-waste", collected: 200, recycled: 80, rate: 40 },
      ],
      insights: [
        "Plastic waste dropped by 10% compared to last week.",
        "Paper recycling rate shows the highest improvement (↑8%).",
        "E-waste recycling rate remains below 50%. Consider special handling.",
      ],
    };
    setTimeout(() => setData(mock), 500);
  }, []);

  if (!data) return <div className="p-4 text-center">Loading Waste Analytics...</div>;

  const COLORS = ["#34A853", "#4285F4", "#F39C12", "#9C27B0", "#E91E63"];

  return (
    <div className="container-fluid py-3">
      <AlertBar message="♻ Recyclables dropped by 10% this week" type="warning" />

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3"><KPICard title="Total Collected" value="3,660 kg" color="#4285F4" icon="🗑️" /></div>
        <div className="col-md-3"><KPICard title="Total Recycled" value="2,540 kg" color="#34A853" icon="♻️" /></div>
        <div className="col-md-3"><KPICard title="Recycle Rate" value="69.4%" color="#673AB7" icon="📈" /></div>
        <div className="col-md-3"><KPICard title="Top Waste Type" value="Paper" color="#F39C12" icon="📰" /></div>
      </div>

      {/* Charts */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card p-3 text-center">
            <h6 className="fw-bold mb-3">Waste Type Composition</h6>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.wasteDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {data.wasteDistribution.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h6 className="fw-bold mb-3">Recyclable vs Non-Recyclable Trend</h6>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="recyclable" stroke="#34A853" strokeWidth={2} />
                <Line type="monotone" dataKey="nonRecyclable" stroke="#F39C12" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table + Insights */}
      <div className="row g-3 mt-4">
        <div className="col-md-7">
          <WasteTypeTable data={data.table} />
        </div>
        <div className="col-md-5">
          <InsightCard title="Key Insights" insights={data.insights} />
          <div className="card mt-3 p-3 text-center">
            <h6 className="fw-bold mb-2">Recycling Awareness</h6>
            <img src={illustration} alt="recycle" className="img-fluid rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
