// src/pages/BinDashboard.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  BarChart3,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Import API functions
import api, { updateBin, deleteBin } from "../api/api";

// ✅ Fix missing default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ✅ Custom bin-type color markers
const getMarkerIcon = (binType) => {
  const colorMap = {
    general: "808080",
    recyclable: "10B981",
    organic: "D97706",
    plastic: "2563EB",
    electronic: "7C3AED",
    hazardous: "DC2626",
  };
  const hex = colorMap[binType] || "64748B";
  return new L.Icon({
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${hex}`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
};

export default function BinDashboard() {
  // 🧩 State management
  const [bins, setBins] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [editBin, setEditBin] = useState(null);
  const [mapView, setMapView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch bins from backend
  useEffect(() => {
    const loadBins = async () => {
      try {
        const res = await api.get("/bins");
        const normalized = (res.data || []).map((b) => ({
          ...b,
          id: b._id?.$oid || b._id || b.binId,
          fillLevel: b.fillLevel ?? Math.floor(Math.random() * 40),
          status: b.status || "active",
        }));
        setBins(normalized);
        toast.success("✅ Bins loaded successfully!");
      } catch (error) {
        console.error("Error fetching bins:", error);
        toast.error("⚠️ Failed to load bins. Check backend connection.");
      }
    };
    loadBins();
  }, []);

  // 🕒 Auto simulate fill-level change
  useEffect(() => {
    const interval = setInterval(() => {
      setBins((prev) =>
        prev.map((b) => ({
          ...b,
          fillLevel: Math.min(100, (b.fillLevel || 0) + Math.random() * 5),
        }))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔍 Filter + Sort logic
  const filteredAndSortedBins = bins
    .filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        b.binId?.toLowerCase().includes(q) ||
        b.residentName?.toLowerCase().includes(q) ||
        b.ownerName?.toLowerCase().includes(q) ||
        b.residentType?.toLowerCase().includes(q) ||
        b.location?.toLowerCase().includes(q);
      const matchesFilter = filter === "all" || b.binType === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.residentName || "").localeCompare(b.residentName || "");
        case "name-desc":
          return (b.residentName || "").localeCompare(a.residentName || "");
        case "fill-level":
          return (b.fillLevel || 0) - (a.fillLevel || 0);
        case "oldest":
          return new Date(a.registrationDate) - new Date(b.registrationDate);
        default:
          return new Date(b.registrationDate) - new Date(a.registrationDate);
      }
    });

  // 📊 Dashboard statistics
  const stats = {
    total: bins.length,
    active: bins.filter((b) => b.status === "active").length,
    full: bins.filter((b) => (b.fillLevel || 0) >= 80).length,
    urgent: bins.filter((b) => (b.fillLevel || 0) >= 90).length,
    byType: {
      recyclable: bins.filter((b) => b.binType === "recyclable").length,
      organic: bins.filter((b) => b.binType === "organic").length,
    },
  };

  // 🎯 Priority indicator
  const getPriority = (bin) => {
    const l = bin.fillLevel || 0;
    if (l >= 90) return { color: "red", label: "Urgent" };
    if (l >= 70) return { color: "orange", label: "Nearly Full" };
    return { color: "green", label: "Active" };
  };

  // 🗑️ Delete Bin (backend integrated)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bin?")) return;

    try {
      await deleteBin(id); // ✅ Call backend DELETE /api/bins/{id}
      setBins(bins.filter((b) => b.binId !== id));
      toast.success(`🗑️ Bin ${id} deleted successfully!`);
    } catch (err) {
      console.error("Error deleting bin:", err);
      toast.error("❌ Failed to delete bin. Check backend logs.");
    }
  };

  // ✏️ Edit Bin (backend integrated)
  const handleEdit = (b) => setEditBin({ ...b });

  const handleSave = async () => {
    if (!editBin.residentName?.trim()) {
      toast.error("Resident name is required");
      return;
    }

    try {
      const id = editBin.binId || editBin.id;
      const res = await updateBin(id, editBin); // ✅ Call backend PUT /api/bins/{id}
      setBins(bins.map((b) => (b.binId === id ? res : b)));
      setEditBin(null);
      toast.success("✅ Bin updated successfully!");
    } catch (err) {
      console.error("Error updating bin:", err);
      toast.error("❌ Failed to update bin. Check backend logs.");
    }
  };

  // 🎟️ QR download
  const downloadQR = (bin) => {
    const canvas = document.getElementById(`qr-${bin.binId}`);
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${bin.binType}-${bin.binId}.png`;
    link.click();
    toast.success(`🎟️ QR downloaded for ${bin.binId}`);
  };

  // 🔄 Refresh
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/bins");
      setBins(res.data);
      toast.success("🔄 Dashboard refreshed!");
    } catch {
      toast.error("⚠️ Failed to refresh data.");
    } finally {
      setIsLoading(false);
    }
  };

  // 📏 Fill-level bar component
  const FillBar = ({ level }) => (
    <div className="w-full bg-gray-200 h-2 rounded-full">
      <div
        className={`h-2 rounded-full transition-all ${
          level >= 90
            ? "bg-red-500"
            : level >= 70
            ? "bg-orange-500"
            : "bg-green-500"
        }`}
        style={{ width: `${level || 0}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-gray-900">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="text-white" size={24} />
              </div>
              Waste Management Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage all smart bins in one place
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setMapView((v) => !v)}
              className={`px-4 py-2 rounded-xl border ${
                mapView
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              <MapPin size={16} className="inline mr-2" />
              {mapView ? "Dashboard View" : "Map View"}
            </button>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl hover:bg-gray-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => (window.location.href = "/register")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg"
            >
              <Plus size={16} />
              Add New Bin
            </button>
          </div>
        </div>
      </motion.div>

      {/* Map or Dashboard */}
      {mapView ? (
        <div className="border rounded-2xl overflow-hidden shadow-md">
          <MapContainer center={[6.9271, 79.8612]} zoom={12} style={{ height: "75vh" }}>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {bins.map((b) => (
              <Marker
                key={b.id}
                position={[b.latitude || 6.9271, b.longitude || 79.8612]}
                icon={getMarkerIcon(b.binType)}
              >
                <Popup>
                  <strong>{b.binType} Bin</strong>
                  <br />ID: {b.binId}
                  <br />Resident: {b.residentName}
                  <br />Fill: {(b.fillLevel || 0).toFixed(0)}%
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="relative w-full md:w-1/2">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, name, or location..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border px-4 py-3 rounded-xl"
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="recyclable">Recyclable</option>
                  <option value="organic">Organic</option>
                  <option value="plastic">Plastic</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border px-4 py-3 rounded-xl"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="fill-level">Fill Level</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bin Cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedBins.map((b, i) => {
              const priority = getPriority(b);
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
                >
                  <div
                    className={`p-4 border-b ${
                      priority.color === "red"
                        ? "bg-red-50 border-red-200"
                        : priority.color === "orange"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 capitalize">
                          {b.binType} Bin
                        </h3>
                        <p className="text-sm text-gray-600 font-mono">{b.binId}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          priority.color === "red"
                            ? "bg-red-100 text-red-700"
                            : priority.color === "orange"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {priority.label}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fill Level</span>
                        <span>{(b.fillLevel || 0).toFixed(0)}%</span>
                      </div>
                      <FillBar level={b.fillLevel} />
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <User size={16} className="text-gray-400 mt-1" />
                      <div>
                        <p className="font-semibold">{b.residentName}</p>
                        <p className="text-sm text-gray-600">
                          {b.ownerName || "—"} • {b.residentType}
                        </p>
                        <div className="flex gap-2 text-sm text-gray-600 mt-1">
                          {b.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {b.phone}
                            </span>
                          )}
                          {b.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} /> {b.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {b.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} /> {b.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} /> {b.collectionFrequency} collection
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                    {/* QR Code */}
                    <div className="flex items-center gap-3">
                      <div className="border rounded-lg p-1">
                        <QRCodeCanvas
                          id={`qr-${b.binId}`}
                          value={b.qrData || `SMARTWASTE:${b.binId}`}
                          size={60}
                          bgColor="#ffffff"
                          fgColor="#059669"
                          level="H"
                        />
                      </div>
                      <button
                        onClick={() => downloadQR(b)}
                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(b)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit bin"
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(b.binId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete bin"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* ✏️ Edit Modal */}
      <AnimatePresence>
        {editBin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditBin(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Edit Bin Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resident Name *
                  </label>
                  <input
                    type="text"
                    value={editBin.residentName || ""}
                    onChange={(e) =>
                      setEditBin({ ...editBin, residentName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner / Organization
                  </label>
                  <input
                    type="text"
                    value={editBin.ownerName || ""}
                    onChange={(e) =>
                      setEditBin({ ...editBin, ownerName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resident Type
                  </label>
                  <select
                    value={editBin.residentType || "House"}
                    onChange={(e) =>
                      setEditBin({ ...editBin, residentType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option>House</option>
                    <option>Shop</option>
                    <option>Apartment</option>
                    <option>School</option>
                    <option>Office</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={editBin.phone || ""}
                    onChange={(e) =>
                      setEditBin({ ...editBin, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Description
                  </label>
                  <input
                    type="text"
                    value={editBin.location || ""}
                    onChange={(e) =>
                      setEditBin({ ...editBin, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bin Size
                    </label>
                    <select
                      value={editBin.binSize || "medium"}
                      onChange={(e) =>
                        setEditBin({ ...editBin, binSize: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="small">Small (50L)</option>
                      <option value="medium">Medium (120L)</option>
                      <option value="large">Large (240L)</option>
                      <option value="commercial">Commercial (1000L+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Frequency
                    </label>
                    <select
                      value={editBin.collectionFrequency || "weekly"}
                      onChange={(e) =>
                        setEditBin({
                          ...editBin,
                          collectionFrequency: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditBin(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-gray-500 text-sm mt-12 pt-8 border-t border-gray-200"
      >
        <p>
          © 2025 Smart Waste Management System | Building Sustainable
          Communities ♻️
        </p>
        <p className="mt-1 text-xs">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </motion.footer>
    </div>
  );
}
