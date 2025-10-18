import React from "react";

export default function AlertBar({ message, type = "warning" }) {
  const colors = {
    warning: "#F39C12",
    success: "#34A853",
    danger: "#E74C3C",
  };

  return (
    <div
      className="d-flex justify-content-between align-items-center px-3 py-2 rounded mb-4"
      style={{
        background: colors[type],
        color: "white",
        fontWeight: 600,
      }}
    >
      <span>{message}</span>
      <button className="btn btn-light btn-sm">View Report</button>
    </div>
  );
}
