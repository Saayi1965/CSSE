import Sidebar from "../../components/Sidebar";
import "../../styles/collector.css";
import { useNavigate } from "react-router-dom";

export default function CollectorDashboard() {
  const navigate = useNavigate();

  const routes = [
    {
      id: 1,
      title: "Colombo District - Zone A",
      location: "Colombo, Western Province",
      bins: 12,
      status: "assigned",
      image: "/assets/RecyLink_Logo.png",
    },
    {
      id: 2,
      title: "North Garden Area",
      location: "Kotahena, Colombo",
      bins: 8,
      status: "pending",
      image: "/assets/RecyLink_Logo.png",
    },
    {
      id: 3,
      title: "Beach Road Collection",
      location: "Mount Lavinia",
      bins: 15,
      status: "completed",
      image: "/assets/RecyLink_Logo.png",
    },
  ];

  return (
    <div className="layout">
     
      <div className="content">
        <div className="collector-header">
          <h1>Waste Collector</h1>
          <div className="header-buttons">
            <button className="outline-btn" onClick={() => navigate("/collector/map")}>
              🗺️ Map View
            </button>
            <button className="outline-btn logout" onClick={() => navigate("/login")}>
              ↩ Logout
            </button>
          </div>
        </div>

        {/* ===== Top Action Cards ===== */}
        <div className="top-actions">
          <div
            className="action-card"
            onClick={() => navigate("/collector/routes")}
          >
            <div className="icon">🗺️</div>
            <div>
              <h3>View Routes on Map</h3>
              <p>See all collection points on an interactive map</p>
            </div>
          </div>

          <div
            className="action-card"
            onClick={() => navigate("/collector/qr")}
          >
            <div className="icon">📷</div>
            <div>
              <h3>Scan Bin QR Code</h3>
              <p>Scan a bin to update collection status</p>
            </div>
          </div>
        </div>

        {/* ===== Collection Routes Section ===== */}
        <div className="route-section">
          <h2>Collection Routes</h2>
          <div className="route-toggle">
            <button className="toggle-btn active">Routes</button>
            <button className="toggle-btn">Bins</button>
          </div>
        </div>

        {/* ===== Route Cards ===== */}
        <div className="routes-grid">
          {routes.map((route) => (
            <div key={route.id} className="route-card">
              <div className="route-header">
                <img src={route.image} alt="Bin Icon" />
                <span className={`status ${route.status}`}>{route.status}</span>
              </div>
              <h3>{route.title}</h3>
              <p className="location">📍 {route.location}</p>
              <p className="bins">{route.bins} bins</p>
              <button
                className="view-btn"
                onClick={() => navigate("/collector/map")}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
