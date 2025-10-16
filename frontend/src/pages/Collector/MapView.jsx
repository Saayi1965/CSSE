import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/collector.css";

export default function MapView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const bin = state?.bin;

  if (!bin) return <p>No bin selected</p>;

  return (
    <div className="collector-container">
      <h2>🗺️ Map View</h2>
      <iframe
        title="map"
        src={`https://www.google.com/maps?q=${bin.lat},${bin.lng}&z=15&output=embed`}
        width="100%"
        height="400"
      />
      <div className="map-info">
        <h3>{bin.code}</h3>
        <p>{bin.location}</p>
        <button onClick={() => navigate("/collector/qr", { state: { bin } })}>
          Scan QR to Confirm Pickup
        </button>
      </div>
    </div>
  );
}
