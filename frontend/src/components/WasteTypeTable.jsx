import React from "react";

export default function WasteTypeTable({ data }) {
  return (
    <div className="card p-3 mt-4">
      <h6 className="fw-bold mb-3">Waste Composition Summary</h6>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Type</th>
              <th>Collected (kg)</th>
              <th>Recycled (kg)</th>
              <th>Recycle Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.type}</td>
                <td>{row.collected}</td>
                <td>{row.recycled}</td>
                <td>
                  <span
                    className={`fw-bold ${
                      row.rate > 70 ? "text-success" : "text-warning"
                    }`}
                  >
                    {row.rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
