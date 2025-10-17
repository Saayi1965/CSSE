import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "../../components/Sidebar";
import "../../styles/mapview.css";
import L from "leaflet";
import { useState } from "react";

// ✅ Fix Leaflet default icon issue (for React builds)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView() {
  const [bins] = useState([
    {
      id: "BIN-101",
      name: "Colombo Fort Bin",
      position: [6.9352, 79.8428],
      status: "Full",
    },
    {
      id: "BIN-102",
      name: "Galle Road Bin",
      position: [6.9271, 79.8612],
      status: "Collected",
    },
    {
      id: "BIN-103",
      name: "Bambalapitiya Bin",
      position: [6.9064, 79.855],
      status: "Maintenance",
    },
  ]);

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
      <Sidebar current="Map View" />
      <div className="content">
        <h1>Collection Map View</h1>

        <div className="card">
          <MapContainer
            center={[6.9271, 79.8612]} // Colombo default center
            zoom={13}
            style={{ height: "450px", width: "100%", borderRadius: "10px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {bins.map((bin) => (
              <Marker key={bin.id} position={bin.position} icon={getIcon(bin.status)}>
                <Popup>
                  <strong>{bin.name}</strong>
                  <br />
                  ID: {bin.id}
                  <br />
                  Status:{" "}
                  <span style={{ color: statusColors[bin.status] }}>
                    {bin.status}
                  </span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="map-legend card">
          <h3>Legend</h3>
          <ul>
            <li>
              <span className="dot full"></span> Full Bins
            </li>
            <li>
              <span className="dot collected"></span> Collected Bins
            </li>
            <li>
              <span className="dot maintenance"></span> Maintenance
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
