import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "../../components/Sidebar";
import "../../styles/viewroutes.css";
import L from "leaflet";
import { useState } from "react";

// ✅ Fix Leaflet default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function ViewRoutes() {
  const [bins] = useState([
    {
      id: "BIN-101",
      name: "Colombo Fort Bin",
      position: [6.9352, 79.8428],
      area: "Colombo Fort",
      status: "Full",
      lastUpdated: "2025-10-16 10:45 AM",
    },
    {
      id: "BIN-102",
      name: "Galle Road Bin",
      position: [6.9271, 79.8612],
      area: "Galle Face",
      status: "Collected",
      lastUpdated: "2025-10-16 9:20 AM",
    },
    {
      id: "BIN-103",
      name: "Bambalapitiya Bin",
      position: [6.9064, 79.855],
      area: "Bambalapitiya",
      status: "Maintenance",
      lastUpdated: "2025-10-15 5:30 PM",
    },
  ]);

  const routePath = bins.map((b) => b.position);

  const statusColors = {
    Full: "red",
    Collected: "green",
    Maintenance: "orange",
  };

  const getIcon = (status) =>
    new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${statusColors[status]}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

  return (
    <div className="layout">
      {/* <Sidebar current="View Routes" /> */}

      <div className="content">
        <header className="viewroutes-header">
          <h1>Collection Route Overview</h1>
          <p className="subtitle">
            Monitor bin locations and collection status in real-time.
          </p>
        </header>

        {/* 🧭 Two-Column Layout */}
        <div className="map-bin-container">
          {/* 🗺️ Left: Map */}
          <div className="card map-card">
            <MapContainer
              center={[6.9271, 79.8612]}
              zoom={13}
              style={{ height: "380px", width: "100%", borderRadius: "12px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Polyline positions={routePath} color="#16a34a" weight={4} opacity={0.8} />
              {bins.map((bin) => (
                <Marker key={bin.id} position={bin.position} icon={getIcon(bin.status)}>
                  <Popup>
                    <strong>{bin.name}</strong>
                    <br />
                    ID: {bin.id}
                    <br />
                    Area: {bin.area}
                    <br />
                    Status:{" "}
                    <span style={{ color: statusColors[bin.status], fontWeight: 600 }}>
                      {bin.status}
                    </span>
                    <br />
                    Last Updated: {bin.lastUpdated}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* 📋 Right: Bin Details */}
          <div className="card bin-card">
            <h2 className="section-title">Bin Details</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Bin ID</th>
                    <th>Name</th>
                    <th>Area</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {bins.map((bin) => (
                    <tr key={bin.id}>
                      <td>{bin.id}</td>
                      <td>{bin.name}</td>
                      <td>{bin.area}</td>
                      <td>
                        <span className={`status ${bin.status.toLowerCase()}`}>
                          {bin.status}
                        </span>
                      </td>
                      <td>{bin.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 🔘 Legend */}
        <div className="map-legend card">
          <h3>Legend</h3>
          <ul>
            <li><span className="dot full"></span> Full Bins</li>
            <li><span className="dot collected"></span> Collected Bins</li>
            <li><span className="dot maintenance"></span> Maintenance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
