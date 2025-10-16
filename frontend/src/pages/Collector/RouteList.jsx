import React, { useEffect, useState } from "react";
import { getBinStatus } from "../../api/api";
import { useNavigate } from "react-router-dom";
import "../../styles/collector.css";

export default function RouteList() {
  const [bins, setBins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getBinStatus()
      .then(setBins)
      .catch(() => alert("Error fetching bins"));
  }, []);

  return (
    <div className="collector-container">
      <h2>📍 Route List</h2>
      <div className="bin-list">
        {bins.map((bin) => (
          <div
            key={bin.id}
            className={`bin-card ${bin.status === "Full" ? "full" : ""}`}
            onClick={() => navigate("/collector/map", { state: { bin } })}
          >
            <p><b>{bin.code}</b></p>
            <p>{bin.location}</p>
            <p>Fill Level: {bin.fillLevel}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
