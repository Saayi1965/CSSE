import React, { useState, useEffect } from "react";
import api from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import "../styles.css";

// Image imports (add these to your assets folder)
const IMAGES = {
  dashboardBg:
    "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  wasteCollection:
    "https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  recycling:
    "https://images.unsplash.com/photo-1587332065603-5e0e4bd833c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  analytics:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
};

const COLORS = ["#10B981", "#4A90E2", "#F39C12", "#6A1B9A", "#50E3C2"];

const theme = {
  primary: "#10B981",
  secondary: "#4A90E2",
  accent: "#F39C12",
  bgLight: "#F9FAFB",
  textDark: "#1E293B",
  textMuted: "#64748B",
  cardShadow: "0 8px 30px rgba(0,0,0,0.08)",
  hoverShadow: "0 20px 40px rgba(16, 185, 129, 0.15)",
};

// Animated Stat Card Component
function StatCard({ title, value, icon, color, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`rounded-3 p-4 text-center position-relative overflow-hidden ${
        isVisible ? "card-enter" : "card-hidden"
      }`}
      style={{
        background: "white",
        boxShadow: theme.cardShadow,
        border: `1px solid rgba(0,0,0,0.05)`,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.6s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = theme.hoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.cardShadow;
      }}
    >
      {/* Background Gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
        }}
      />

      <div
        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
        style={{
          width: 60,
          height: 60,
          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
          fontSize: "24px",
          transition: "transform 0.3s ease",
        }}
      >
        {icon}
      </div>
      <h6
        className="fw-semibold mb-2"
        style={{ color: theme.textMuted, fontSize: "0.9rem" }}
      >
        {title}
      </h6>
      <h4
        className="fw-bold mb-0"
        style={{ color: theme.textDark, fontSize: "1.5rem" }}
      >
        {value}
      </h4>
    </div>
  );
}

// Enhanced Circular Progress
function CircularProgress({ value, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          current = value;
          clearInterval(timer);
        }
        setAnimatedValue(Math.round(current));
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, value]);

  const size = 100,
    stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  return (
    <div
      className={`text-center ${isVisible ? "card-enter" : "card-hidden"}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.8)",
        transition: "all 0.6s ease",
      }}
    >
      <div className="position-relative d-inline-block">
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.primary}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy="0.3em"
            fontSize="16"
            fill={theme.textDark}
            fontWeight="600"
          >
            {animatedValue}%
          </text>
        </svg>
      </div>
      <div
        className="small fw-semibold mt-2"
        style={{ color: theme.textMuted }}
      >
        Recycling Rate
      </div>
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState({
    start: "2025-10-01",
    end: "2025-10-15",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/reports/summary?startDate=${range.start}&endDate=${range.end}`
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData({
        totalWeight: "3,254t",
        records: 16,
        recyclingRate: 57,
        avgPerArea: "12.5t",
        byType: { General: 920, Recyclables: 600, Organic: 890, Other: 810 },
      });
    } finally {
      setLoading(false);
    }
  };

  const pieData = data
    ? Object.entries(data.byType).map(([k, v], i) => ({
        name: k,
        value: typeof v === "number" ? v : parseInt(v),
        color: COLORS[i % COLORS.length],
      }))
    : [];

  const barData = [
    { name: "Mon", waste: 420, recycling: 240 },
    { name: "Tue", waste: 380, recycling: 200 },
    { name: "Wed", waste: 510, recycling: 290 },
    { name: "Thu", waste: 460, recycling: 260 },
    { name: "Fri", waste: 390, recycling: 220 },
    { name: "Sat", waste: 320, recycling: 180 },
    { name: "Sun", waste: 280, recycling: 150 },
  ];

  // Export CSV: try backend first, then fallback to client-side CSV generation
  const exportCsv = async () => {
    try {
      // Try backend CSV export (expects blob)
      const res = await api.get("/reports/export", {
        params: { startDate: range.start, endDate: range.end },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `report_${range.start}_${range.end}.csv`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn(
        "Backend export failed or unavailable, falling back to client CSV generation.",
        err
      );

      // Fallback: build a tiny CSV from the in-memory `data` if available
      if (!data) {
        alert("No data available to export. Generate a report first.");
        return;
      }

      try {
        const rows = [];
        rows.push(["Metric", "Value"]);
        rows.push(["Total Weight", data.totalWeight]);
        rows.push(["Records", data.records]);
        rows.push(["Recycling Rate (%)", data.recyclingRate]);
        rows.push(["Average per Area", data.avgPerArea]);
        rows.push([]);
        rows.push(["Type", "Weight"]);
        Object.entries(data.byType).forEach(([k, v]) => rows.push([k, v]));

        const csvContent = rows
          .map((r) =>
            r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
          )
          .join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report_${range.start}_${range.end}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Client-side CSV export failed", e);
        alert("Export failed. See console for details.");
      }
    }
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${theme.bgLight} 0%, #ffffff 100%)`,
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* Enhanced Header with Background Image */}
      <div
        className="rounded-4 mb-4 text-white p-5 position-relative overflow-hidden"
        style={{
          // Provide the remote image first; if it fails to load due to TLS/NET issues the browser will still render the gradient and the fallback SVG
          backgroundImage: `linear-gradient(135deg, ${theme.primary}99, ${theme.secondary}99), url(${IMAGES.dashboardBg}), url('/images/placeholder.svg')`,
          backgroundSize: "cover, cover, cover",
          backgroundPosition: "center, center, center",
          boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)",
        }}
      >
        <div className="position-relative">
          <h2 className="fw-bold mb-2 display-6">RecyLink Analytics</h2>
          <p className="mb-0 fs-5 opacity-90">
            Smart waste insights made simple and beautiful
          </p>
        </div>
      </div>

      {/* Animated Stat Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <StatCard
            title="Total Waste Collected"
            value={data ? data.totalWeight : "--"}
            icon="🗑️"
            color={theme.primary}
            delay={100}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Collection Records"
            value={data ? data.records : "--"}
            icon="📋"
            color={theme.secondary}
            delay={200}
          />
        </div>
        <div className="col-md-3">
          <div
            className="rounded-3 p-4 text-center bg-white shadow-sm h-100 d-flex flex-column justify-content-center"
            style={{
              boxShadow: theme.cardShadow,
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <CircularProgress
              value={data ? data.recyclingRate : 0}
              delay={300}
            />
          </div>
        </div>
        <div className="col-md-3">
          <StatCard
            title="Average per Area"
            value={data ? data.avgPerArea : "--"}
            icon="📍"
            color={theme.accent}
            delay={400}
          />
        </div>
      </div>

      {/* Enhanced Report Filters */}
      <div
        className="rounded-3 p-4 mb-5 bg-white position-relative overflow-hidden"
        style={{
          boxShadow: theme.cardShadow,
          border: "1px solid rgba(0,0,0,0.05)",
          background: `linear-gradient(135deg, #ffffff 0%, ${theme.bgLight} 100%)`,
        }}
      >
        <div className="row align-items-center g-4">
          <div className="col-md-3">
            <label className="form-label fw-semibold text-muted small mb-2">
              Date Range
            </label>
            <div className="d-flex gap-2">
              <input
                type="date"
                className="form-control border-1"
                value={range.start}
                onChange={(e) => setRange({ ...range, start: e.target.value })}
                style={{ borderColor: "rgba(0,0,0,0.1)" }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold text-muted small mb-2">
              Report Type
            </label>
            <select
              className="form-select border-1"
              style={{ borderColor: "rgba(0,0,0,0.1)" }}
            >
              <option>Weekly Report</option>
              <option>Monthly Report</option>
              <option>Custom Report</option>
            </select>
          </div>
          <div className="col-md-6 text-end">
            <button
              className="btn me-3 px-4 py-2 fw-semibold"
              onClick={load}
              disabled={loading}
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                color: "white",
                border: "none",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
              }}
            >
              {loading ? "🔄 Loading..." : "📊 Generate Report"}
            </button>
            <button
              className="btn btn-outline-primary px-4 py-2 fw-semibold"
              onClick={exportCsv}
              style={{
                borderColor: theme.primary,
                color: theme.primary,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = theme.primary;
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = theme.primary;
              }}
            >
              📥 Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="row g-4">
        <div className="col-md-7">
          <div
            className="rounded-3 p-4 bg-white shadow-sm h-100 position-relative overflow-hidden"
            style={{
              boxShadow: theme.cardShadow,
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div className="d-flex align-items-center mb-4">
              <div
                className="rounded-circle p-2 me-3"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}10)`,
                }}
              >
                <span style={{ color: theme.primary, fontSize: "20px" }}>
                  📈
                </span>
              </div>
              <h6
                className="fw-semibold mb-0"
                style={{ color: theme.textDark }}
              >
                Waste Collection Trends
              </h6>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke={theme.textMuted} />
                <YAxis stroke={theme.textMuted} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: `1px solid ${theme.primary}20`,
                    boxShadow: theme.cardShadow,
                  }}
                />
                <Bar
                  dataKey="waste"
                  radius={[4, 4, 0, 0]}
                  fill={theme.primary}
                />
                <Bar
                  dataKey="recycling"
                  radius={[4, 4, 0, 0]}
                  fill={theme.secondary}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-5">
          <div
            className="rounded-3 p-4 bg-white shadow-sm h-100"
            style={{
              boxShadow: theme.cardShadow,
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div className="d-flex align-items-center mb-4">
              <div
                className="rounded-circle p-2 me-3"
                style={{
                  background: `linear-gradient(135deg, ${theme.secondary}20, ${theme.secondary}10)`,
                }}
              >
                <span style={{ color: theme.secondary, fontSize: "20px" }}>
                  🥧
                </span>
              </div>
              <h6
                className="fw-semibold mb-0"
                style={{ color: theme.textDark }}
              >
                Waste Distribution
              </h6>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelStyle={{
                    fill: theme.textDark,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
