import Sidebar from "../../components/Sidebar";
import "../../styles/qrscan.css";
import { useState } from "react";

export default function QRScan() {
  const [manualID, setManualID] = useState("");
  const [recentScans, setRecentScans] = useState([
    { id: "BIN-204", time: "2025-10-17 10:12 AM" },
    { id: "BIN-198", time: "2025-10-17 9:45 AM" },
    { id: "BIN-190", time: "2025-10-16 4:20 PM" },
  ]);

  const handleManualSubmit = () => {
    if (manualID.trim()) {
      const newScan = {
        id: manualID.trim(),
        time: new Date().toLocaleString(),
      };
      setRecentScans([newScan, ...recentScans]);
      setManualID("");
    }
  };

  return (
    <div className="layout">
      <Sidebar current="QR Scan" />

      <div className="content">
        <h1>Scan Bin QR Code</h1>
        <p className="subtitle">
          Use your camera to scan a bin’s QR code or enter its ID manually.
        </p>

        {/* Main Scan Area */}
        <div className="card scan-container">
          <div className="scan-box">
            <div className="camera-icon">📷</div>
            <p className="scan-text">Camera Scanner Placeholder</p>
            <button className="primary">Start Scanning</button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="manual-entry">
            <input
              type="text"
              placeholder="Enter Bin ID (e.g. BIN-12345)"
              value={manualID}
              onChange={(e) => setManualID(e.target.value)}
            />
            <button className="primary" onClick={handleManualSubmit}>
              Submit
            </button>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="card recent-scans">
          <h2>Recent Scans</h2>
          {recentScans.length === 0 ? (
            <p className="empty-text">No scans yet.</p>
          ) : (
            <ul>
              {recentScans.map((scan, index) => (
                <li key={index}>
                  <span className="bin-id">{scan.id}</span>
                  <span className="time">{scan.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
