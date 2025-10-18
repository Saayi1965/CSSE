// src/pages/BinDashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// QR preview and sticker handled by QRSticker component
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  BarChart3,
  Crosshair,
  Map as MapIcon,
  LocateFixed,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/SiteHeader";

import api, { updateBin, deleteBin } from "../api/api";
import QRSticker from "../components/QRSticker";

// ---------- Leaflet default icon fix ----------
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ---------- Colored markers by binType ----------
const getMarkerIcon = (binType) => {
  const colorMap = {
    general: "grey",
    recyclable: "green",
    organic: "orange",
    plastic: "blue",
    electronic: "violet",
    hazardous: "red",
  };
  const color = colorMap[binType] || "grey";
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// ---------- Small helpers ----------
const fmtCoord = (n) => (typeof n === "number" ? n.toFixed(5) : "");
const recomputeQR = (binId, binType, lat, lng) =>
  `SMARTWASTE:${binId}:${binType}:${Number(lat || 0).toFixed(6)}:${Number(lng || 0).toFixed(6)}`;

const FALLBACK_CENTER = [6.9271, 79.8612]; // Colombo

export default function BinDashboard() {
  // ---------------- State ----------------
  const [bins, setBins] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [editBin, setEditBin] = useState(null);
  const [mapView, setMapView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // location picker modal
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [draftLocation, setDraftLocation] = useState({ lat: null, lng: null });

  // ---------------- Load bins ----------------
  useEffect(() => {
    const loadBins = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setBins([]);
          toast.error("You are not logged in. Please log in to view your bins.");
          return;
        }
        const username = localStorage.getItem("username") || "";
        const res = await api.get(`/bins?ownerName=${encodeURIComponent(username)}`);
        const normalized = (res.data || []).map((b) => ({
          ...b,
          id: b._id?.$oid || b._id || b.binId, // stable key
          fillLevel: typeof b.fillLevel === "number" ? b.fillLevel : Math.floor(Math.random() * 40),
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

  // ---------------- Simulate fill levels (optional) ----------------
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

  // ---------------- Filtering & sorting (show only my bins) ----------------
  const filteredAndSortedBins = useMemo(() => {
    const username = localStorage.getItem("username") || "";
    const q = searchQuery.trim().toLowerCase();
    // Only show bins where ownerName matches logged-in user
    const myBins = bins.filter((b) => (b.ownerName || "").toLowerCase() === username.toLowerCase());
    const filtered = myBins.filter((b) => {
      const matchesSearch =
        (b.binId || "").toLowerCase().includes(q) ||
        (b.residentName || "").toLowerCase().includes(q) ||
        (b.ownerName || "").toLowerCase().includes(q) ||
        (b.residentType || "").toLowerCase().includes(q) ||
        (b.location || "").toLowerCase().includes(q) ||
        (b.address || "").toLowerCase().includes(q);
      const matchesFilter = filter === "all" || b.binType === filter;
      return matchesSearch && matchesFilter;
    });

    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.residentName || "").localeCompare(b.residentName || "");
        case "name-desc":
          return (b.residentName || "").localeCompare(a.residentName || "");
        case "fill-level":
          return (b.fillLevel || 0) - (a.fillLevel || 0);
        case "oldest":
          return new Date(a.registrationDate || 0) - new Date(b.registrationDate || 0);
        default:
          // newest
          return new Date(b.registrationDate || 0) - new Date(a.registrationDate || 0);
      }
    });

    return sorted;
  }, [bins, filter, sortBy, searchQuery]);

  // ---------------- Stats ----------------
  const stats = useMemo(() => ({
    total: bins.length,
    active: bins.filter((b) => b.status === "active").length,
    full: bins.filter((b) => (b.fillLevel || 0) >= 80).length,
    urgent: bins.filter((b) => (b.fillLevel || 0) >= 90).length,
    byType: {
      recyclable: bins.filter((b) => b.binType === "recyclable").length,
      organic: bins.filter((b) => b.binType === "organic").length,
      plastic: bins.filter((b) => b.binType === "plastic").length,
      general: bins.filter((b) => b.binType === "general").length,
    },
  }), [bins]);

  // ---------------- Priority badge ----------------
  const getPriority = (bin) => {
    const l = bin.fillLevel || 0;
    if (l >= 90) return { color: "red", label: "Urgent" };
    if (l >= 70) return { color: "orange", label: "Nearly Full" };
    return { color: "green", label: "Active" };
  };

  // ---------------- Delete ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bin?")) return;
    try {
      await deleteBin(id);
      setBins((prev) => prev.filter((b) => b.binId !== id));
      toast.success(`🗑️ Bin ${id} deleted successfully!`);
    } catch (err) {
      console.error("Error deleting bin:", err);
      toast.error("❌ Failed to delete bin. Check backend logs.");
    }
  };

  // ---------------- Edit modal ----------------
  const handleEdit = (b) => {
    setEditBin({ ...b });
    setDraftLocation({
      lat: typeof b.latitude === "number" ? b.latitude : null,
      lng: typeof b.longitude === "number" ? b.longitude : null,
    });
  };

  // open location picker
  const openLocationPicker = () => {
    if (!editBin) return;
    setDraftLocation({
      lat: typeof editBin.latitude === "number" ? editBin.latitude : null,
      lng: typeof editBin.longitude === "number" ? editBin.longitude : null,
    });
    setLocationPickerOpen(true);
  };

  // Use my location in picker
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device.");
      return;
    }
    toast.loading("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        setDraftLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        toast.success("📍 Location set.");
      },
      (err) => {
        toast.dismiss();
        console.error(err);
        toast.error("Unable to get current location.");
      }
    );
  };

  // confirm location pick
  const confirmLocationPick = () => {
    if (!editBin) return;
    const { lat, lng } = draftLocation;
    // Update editBin silently; do not show coords in UI
    const locText =
      typeof lat === "number" && typeof lng === "number"
        ? `Auto-detected at ${fmtCoord(lat)}, ${fmtCoord(lng)}`
        : editBin.location || "—";

    setEditBin((prev) => ({
      ...prev,
      latitude: lat ?? prev.latitude,
      longitude: lng ?? prev.longitude,
      location: locText,
    }));
    setLocationPickerOpen(false);
  };

  // cancel picker
  const cancelLocationPick = () => setLocationPickerOpen(false);

  // Save changes (recompute QR if binType or coords changed)
  const handleSave = async () => {
    if (!editBin?.residentName?.trim()) {
      toast.error("Resident name is required");
      return;
    }
    if (!editBin?.phone?.match(/^\+?[\d\s-()]{10,}$/)) {
      toast.error("📱 Enter a valid phone number");
      return;
    }

    try {
      const original = bins.find((x) => x.binId === editBin.binId) || {};
      const lat = typeof editBin.latitude === "number" ? editBin.latitude : original.latitude;
      const lng = typeof editBin.longitude === "number" ? editBin.longitude : original.longitude;
      const type = editBin.binType || original.binType || "general";

      // If binType or coords changed vs original, recompute QR
      const mustRegenQR =
        original.binType !== type ||
        Number(original.latitude ?? 0).toFixed(6) !== Number(lat ?? 0).toFixed(6) ||
        Number(original.longitude ?? 0).toFixed(6) !== Number(lng ?? 0).toFixed(6);

      const payload = {
        ...editBin,
        latitude: lat,
        longitude: lng,
        qrData: mustRegenQR ? recomputeQR(editBin.binId, type, lat, lng) : editBin.qrData,
      };

      const saved = await updateBin(editBin.binId, payload);
      // Normalize saved (some backends return without _id)
      const normalized = {
        ...saved,
        id: saved._id?.$oid || saved._id || saved.binId,
        fillLevel: typeof saved.fillLevel === "number" ? saved.fillLevel : original.fillLevel || 0,
        status: saved.status || original.status || "active",
      };

      setBins((prev) => prev.map((b) => (b.binId === normalized.binId ? normalized : b)));
      setEditBin(null);
      toast.success("✅ Bin updated successfully!");
    } catch (err) {
      console.error("Error updating bin:", err);
      toast.error("❌ Failed to update bin. Check backend logs.");
    }
  };

  // QR handled by QRSticker component

  // ---------------- Refresh ----------------
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setBins([]);
        toast.error("You are not logged in. Please log in to view your bins.");
        setIsLoading(false);
        return;
      }
      const username = localStorage.getItem("username") || "";
      const res = await api.get(`/bins?ownerName=${encodeURIComponent(username)}`);
      const normalized = (res.data || []).map((b) => ({
        ...b,
        id: b._id?.$oid || b._id || b.binId,
        fillLevel: typeof b.fillLevel === "number" ? b.fillLevel : Math.floor(Math.random() * 40),
        status: b.status || "active",
      }));
      setBins(normalized);
      toast.success("🔄 Dashboard refreshed!");
    } catch {
      toast.error("⚠️ Failed to refresh data.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- UI bits ----------------
  const FillBar = ({ level }) => (
    <div className="w-full bg-gray-200 h-2 rounded-full">
      <div
        className={`h-2 rounded-full transition-all ${
          (level || 0) >= 90
            ? "bg-red-500"
            : (level || 0) >= 70
            ? "bg-orange-500"
            : "bg-green-500"
        }`}
        style={{ width: `${level || 0}%` }}
      />
    </div>
  );

  return (
    <>
      <Header />
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
              <MapIcon size={16} className="inline mr-2" />
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

        {/* Stats (only in dashboard view) */}
        {!mapView && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total Bins", value: stats.total, icon: "🗑️" },
              { label: "Active", value: stats.active, icon: "✅" },
              { label: "Nearly Full", value: stats.full, icon: "⚠️" },
              { label: "Urgent", value: stats.urgent, icon: "🚨" },
              { label: "Recyclable", value: stats.byType.recyclable, icon: "♻️" },
              { label: "Organic", value: stats.byType.organic, icon: "🌱" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center"
              >
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-gray-600">{s.label}</p>
                <p className="text-xl">{s.icon}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Map or Dashboard */}
      {mapView ? (
        <div className="border rounded-2xl overflow-hidden shadow-md">
          <MapContainer
            center={
              filteredAndSortedBins.length
                ? [
                    filteredAndSortedBins[0].latitude || FALLBACK_CENTER[0],
                    filteredAndSortedBins[0].longitude || FALLBACK_CENTER[1],
                  ]
                : FALLBACK_CENTER
            }
            zoom={12}
            style={{ height: "75vh" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredAndSortedBins.map((b) => (
              <Marker
                key={b.id}
                position={[
                  b.latitude || FALLBACK_CENTER[0],
                  b.longitude || FALLBACK_CENTER[1],
                ]}
                icon={getMarkerIcon(b.binType)}
              >
                <Popup>
                  <strong className="capitalize">{b.binType} Bin</strong>
                  <br />ID: {b.binId}
                  <br />Resident: {b.residentName}
                  <br />Location: {b.location || "—"}
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
                  placeholder="Search by ID, name, address, or location..."
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
                  <option value="electronic">Electronic</option>
                  <option value="hazardous">Hazardous</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border px-4 py-3 rounded-xl"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="fill-level">Fill Level</option>
                  <option value="name-asc">Name A–Z</option>
                  <option value="name-desc">Name Z–A</option>
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
                        <p className="text-sm text-gray-600 font-mono">
                          {b.binId}
                        </p>
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
                        <div className="flex gap-2 text-sm text-gray-600 mt-1 flex-wrap">
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
                    {(b.address || b.location) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span className="truncate">
                          {b.address || b.location}
                          {b.address && b.location ? ` • ${b.location}` : ""}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} /> {b.collectionFrequency} collection
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                    {/* QR preview + Sticker download */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <QRSticker bin={b} />
                    </div>

                    {/* Actions */}
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

      {/* ---------------- Edit Modal ---------------- */}
      <AnimatePresence>
        {editBin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditBin(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  Edit Bin Details
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  ID: {editBin.binId}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resident Name *</label>
                  <input
                    type="text"
                    value={editBin.residentName || ""}
                    onChange={(e) => setEditBin({ ...editBin, residentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner / Organization</label>
                  <input
                    type="text"
                    value={editBin.ownerName || ""}
                    onChange={(e) => setEditBin({ ...editBin, ownerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resident Type</label>
                  <select
                    value={editBin.residentType || "House"}
                    onChange={(e) => setEditBin({ ...editBin, residentType: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={editBin.phone || ""}
                    onChange={(e) => setEditBin({ ...editBin, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="+94 71 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editBin.email || ""}
                    onChange={(e) => setEditBin({ ...editBin, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection Frequency</label>
                  <select
                    value={editBin.collectionFrequency || "weekly"}
                    onChange={(e) => setEditBin({ ...editBin, collectionFrequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
                  <select
                    value={editBin.binType || "general"}
                    onChange={(e) => setEditBin({ ...editBin, binType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="general">General</option>
                    <option value="recyclable">Recyclable</option>
                    <option value="organic">Organic</option>
                    <option value="plastic">Plastic</option>
                    <option value="electronic">Electronic</option>
                    <option value="hazardous">Hazardous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bin Size</label>
                  <select
                    value={editBin.binSize || "medium"}
                    onChange={(e) => setEditBin({ ...editBin, binSize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="small">Small (50L)</option>
                    <option value="medium">Medium (120L)</option>
                    <option value="large">Large (240L)</option>
                    <option value="commercial">Commercial (1000L+)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editBin.address || ""}
                    onChange={(e) => setEditBin({ ...editBin, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Street address, City, Postal Code"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bin Location (human-readable)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editBin.location || ""}
                      onChange={(e) => setEditBin({ ...editBin, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., Near front gate / Block A parking"
                    />
                    <button
                      type="button"
                      onClick={openLocationPicker}
                      className="whitespace-nowrap flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      title="Edit precise location on map"
                    >
                      <Crosshair size={16} />
                      Edit location
                    </button>
                  </div>
                  {/* Coordinates intentionally hidden from UI */}
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

      {/* ---------------- Location Picker Modal ---------------- */}
      <AnimatePresence>
        {locationPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3"
            onClick={cancelLocationPick}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <MapIcon size={18} />
                  <h4 className="font-semibold">Set Bin Location</h4>
                </div>
                <div className="text-xs text-gray-500">
                  Click on the map to move the pin
                </div>
              </div>

              <div className="p-4">
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={useMyLocation}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <LocateFixed size={16} />
                    Use My Location
                  </button>
                  {typeof draftLocation.lat === "number" && typeof draftLocation.lng === "number" && (
                    <div className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                      Selected: {fmtCoord(draftLocation.lat)}, {fmtCoord(draftLocation.lng)}
                    </div>
                  )}
                </div>

                <div className="rounded-xl overflow-hidden border">
                  <MapPicker
                    value={draftLocation}
                    onChange={setDraftLocation}
                    center={
                      typeof draftLocation.lat === "number" && typeof draftLocation.lng === "number"
                        ? [draftLocation.lat, draftLocation.lng]
                        : FALLBACK_CENTER
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={cancelLocationPick}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLocationPick}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Confirm location
                  </button>
                </div>
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
        <p>© {new Date().getFullYear()} Smart Waste Management System | Building Sustainable Communities ♻️</p>
        <p className="mt-1 text-xs">Last updated: {new Date().toLocaleDateString()}</p>
      </motion.footer>
    </div>
    </>
  );
}

/** ---------------- Map Picker Component ---------------- */
function MapPicker({ value, onChange, center }) {
  const current = Array.isArray(center) ? center : FALLBACK_CENTER;
  const icon = getMarkerIcon("general");

  function ClickHandler() {
    useMapEvents({
      click(e) {
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  return (
    <MapContainer center={current} zoom={13} style={{ height: 420, width: "100%" }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler />
      {typeof value.lat === "number" && typeof value.lng === "number" && (
        <Marker position={[value.lat, value.lng]} icon={icon} />
      )}
    </MapContainer>
  );
  
}
