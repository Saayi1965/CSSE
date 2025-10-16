import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/collector.css";

export default function QRScan() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bin = state?.bin;

  const handleScan = () => {
    alert(`✅ QR verified for Bin: ${bin.code}`);
    navigate("/collector/update", { state: { bin } });
  };

  return (
    <div className="collector-container">
      <h2>📷 Scan QR Code</h2>
      <div className="qr-box">
        <p>QR Simulation — place QR in front of scanner</p>
        <button onClick={handleScan}>Simulate QR Scan</button>
      </div>
    </div>
  );
}
