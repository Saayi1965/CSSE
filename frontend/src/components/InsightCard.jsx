import React from "react";

export default function InsightCard({ title, insights }) {
  return (
    <div className="card p-3 mt-3">
      <h6 className="fw-bold mb-3">{title}</h6>
      <ul className="list-unstyled mb-0">
        {insights.map((item, i) => (
          <li key={i} className="mb-2 d-flex align-items-start">
            <span style={{ fontSize: 18, marginRight: 8 }}>💡</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
