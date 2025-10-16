import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import toast, { Toaster } from "react-hot-toast";
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Plus,
  BarChart3,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  RefreshCw
} from "lucide-react";

// 🗺️ Map imports and icon fix
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Fix missing default marker icons in React/Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🎨 Custom color-coded icons by bin type (overrides default)
const getMarkerIcon = (binType) => {
  const colorMap = {
    general: "808080",     // grey
    recyclable: "10B981",  // green
    organic: "D97706",     // orange
    plastic: "2563EB",     // blue
    electronic: "7C3AED",  // violet
    hazardous: "DC2626",   // red
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
  // ✅ Load bins from localStorage
  const [bins, setBins] = useState(() => {
    const saved = localStorage.getItem("registeredBins");
    return saved ? JSON.parse(saved) : [];
  });

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [editBin, setEditBin] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🌍 New: toggle full-page map view
  const [mapView, setMapView] = useState(false);

  // ✅ Auto-save bins
  useEffect(() => {
    localStorage.setItem("registeredBins", JSON.stringify(bins));
  }, [bins]);

  // ✅ Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBins(prevBins => 
        prevBins.map(bin => ({
          ...bin,
          fillLevel: Math.min(100, (bin.fillLevel || 0) + Math.random() * 5),
          lastUpdated: new Date().toISOString()
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // 🔍 Enhanced Filter & Search
  const filteredAndSortedBins = bins
    .filter(bin => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        bin.binId?.toLowerCase().includes(q) ||
        bin.residentName?.toLowerCase().includes(q) ||
        bin.ownerName?.toLowerCase().includes(q) ||
        bin.residentType?.toLowerCase().includes(q) ||
        bin.location?.toLowerCase().includes(q);
      const matchesFilter = filter === "all" || bin.binType === filter;
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
        default: // newest
          return new Date(b.registrationDate) - new Date(a.registrationDate);
      }
    });

  // 📊 Enhanced Statistics
  const stats = {
    total: bins.length,
    active: bins.filter(b => b.status === "active").length,
    full: bins.filter(b => (b.fillLevel || 0) >= 80).length,
    needsAttention: bins.filter(b => (b.fillLevel || 0) >= 90).length,
    byType: {
      general: bins.filter(b => b.binType === "general").length,
      recyclable: bins.filter(b => b.binType === "recyclable").length,
      organic: bins.filter(b => b.binType === "organic").length,
      plastic: bins.filter(b => b.binType === "plastic").length,
      electronic: bins.filter(b => b.binType === "electronic").length,
      hazardous: bins.filter(b => b.binType === "hazardous").length,
    }
  };

  // 🎯 Collection Priority Calculation
  const getCollectionPriority = (bin) => {
    const fillLevel = bin.fillLevel || 0;
    if (fillLevel >= 90) return { level: "high", color: "red", label: "Urgent" };
    if (fillLevel >= 70) return { level: "medium", color: "orange", label: "Soon" };
    return { level: "low", color: "green", label: "Scheduled" };
  };

  // 🧹 Delete Bin with Confirmation
  const handleDelete = (binId) => {
    if (window.confirm("Are you sure you want to delete this bin? This action cannot be undone.")) {
      setBins(bins.filter((b) => b.binId !== binId));
      toast.success(`🗑️ Bin ${binId} deleted successfully`);
    }
  };

  // ✏️ Enhanced Edit Functionality
  const handleEdit = (bin) => {
    setEditBin({ ...bin });
  };

  const handleSaveEdit = () => {
    if (!editBin.residentName?.trim() || !editBin.phone?.trim()) {
      toast.error("⚠️ Resident name and phone are required!");
      return;
    }

    setBins(bins.map((b) => (b.binId === editBin.binId ? editBin : b)));
    setEditBin(null);
    toast.success("✅ Bin details updated successfully!");
  };

  // 📥 Enhanced QR Sticker Download
  const downloadQR = (bin) => {
    const themes = {
      general: { color: "#64748B", label: "General Waste ♻️" },
      recyclable: { color: "#059669", label: "Recyclable Waste ♻️" },
      organic: { color: "#CA8A04", label: "Organic Waste 🌱" },
      plastic: { color: "#2563EB", label: "Plastic Waste 🧴" },
      electronic: { color: "#9333EA", label: "E-Waste ⚡" },
      hazardous: { color: "#DC2626", label: "Hazardous Waste ☣️" },
    };

    const theme = themes[bin.binType] || themes.general;

    // Get QR from DOM
    const qrCanvas = document.getElementById(`qr-${bin.binId}`);
    if (!qrCanvas) {
      toast.error("QR not found on screen!");
      return;
    }

    // Create sticker canvas
    const stickerCanvas = document.createElement("canvas");
    const ctx = stickerCanvas.getContext("2d");

    // Sticker size
    const width = 400;
    const height = 280;
    stickerCanvas.width = width;
    stickerCanvas.height = height;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Header bar
    ctx.fillStyle = theme.color;
    ctx.fillRect(0, 0, width, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(theme.label, width / 2, 38);

    // Draw QR (left)
    const qrSize = 130;
    ctx.drawImage(qrCanvas, 30, 90, qrSize, qrSize);

    // Text section
    ctx.fillStyle = "#111827";
    ctx.textAlign = "left";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`Bin ID: ${bin.binId}`, 180, 110);
    ctx.font = "14px Arial";
    ctx.fillText(`Resident: ${bin.residentName || "N/A"}`, 180, 135);
    ctx.fillText(`Owner/Org: ${bin.ownerName || "N/A"}`, 180, 160);
    ctx.fillText(`Type: ${bin.residentType || "N/A"}`, 180, 185);
    ctx.fillText(`Location: ${bin.location || "N/A"}`, 180, 210);
    ctx.fillText(`Collection: ${bin.collectionFrequency || "weekly"}`, 180, 235);

    // Footer
    ctx.font = "12px Arial";
    ctx.fillStyle = "#6B7280";
    ctx.textAlign = "center";
    ctx.fillText("Smart Waste Management System", width / 2, height - 15);

    // Download the final sticker
    const imageUrl = stickerCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${bin.binType}-Sticker-${bin.binId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`🎟️ ${theme.label} sticker downloaded!`);
  };

  // 🔄 Refresh Data
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Data refreshed successfully!");
    }, 1000);
  };

  // 🧭 Colored marker by type (uses Google Charts pin to avoid Leaflet asset issues)
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

  // 🎨 Fill Level Bar Component
  const FillLevelBar = ({ level = 0 }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-500 ${
          level >= 90 ? 'bg-red-500' :
          level >= 70 ? 'bg-orange-500' :
          level >= 50 ? 'bg-yellow-500' :
          'bg-green-500'
        }`}
        style={{ width: `${level}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="text-white" size={24} />
              </div>
              Waste Management Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage all your smart bins in one place
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* 🗺️ Map View Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMapView((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                mapView
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <MapPin size={18} />
              {mapView ? "Dashboard View" : "Map View"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/register'}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition"
            >
              <Plus size={18} />
              Add New Bin
            </motion.button>
          </div>
        </div>

        {/* 📊 Stats Overview */}
        {!mapView && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total Bins", value: stats.total, icon: "🗑️" },
              { label: "Active", value: stats.active, icon: "✅" },
              { label: "Nearly Full", value: stats.full, icon: "⚠️" },
              { label: "Urgent", value: stats.needsAttention, icon: "🚨" },
              { label: "Recyclable", value: stats.byType.recyclable, icon: "♻️" },
              { label: "Organic", value: stats.byType.organic, icon: "🌱" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {mapView ? (
        // 🌍 Full-page Map View
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg"
        >
          <MapContainer
            center={[6.9271, 79.8612]} // Default to Colombo
            zoom={12}
            style={{ height: "75vh", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {bins.map((bin) => {
              const lat = typeof bin.lat === "number" ? bin.lat : 6.9271;
              const lng = typeof bin.lng === "number" ? bin.lng : 79.8612;
              return (
                <Marker
                  key={bin.binId}
                  position={[lat, lng]}
                  icon={getMarkerIcon(bin.binType)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{bin.binType} Bin</p>
                      <p>ID: {bin.binId}</p>
                      <p>Resident: {bin.residentName || "—"}</p>
                      <p>Fill: {(bin.fillLevel || 0).toFixed(0)}%</p>
                      {bin.location && <p>Loc: {bin.location}</p>}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </motion.div>
      ) : (
        <>
          {/* 🔍 Enhanced Filter & Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by bin ID, resident name, owner, type, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 transition"
                >
                  <option value="all">All Types</option>
                  <option value="general">General Waste</option>
                  <option value="recyclable">Recyclable</option>
                  <option value="organic">Organic</option>
                  <option value="plastic">Plastic</option>
                  <option value="electronic">E-Waste</option>
                  <option value="hazardous">Hazardous</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 transition"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="fill-level">Fill Level</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-gray-600 text-sm">
                Showing <strong>{filteredAndSortedBins.length}</strong> of {bins.length} bins
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </motion.div>

          {/* 🧾 Enhanced Bin Cards */}
          <AnimatePresence>
            {filteredAndSortedBins.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🗑️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchQuery ? "No bins found" : "No bins registered yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? "Try adjusting your search criteria" 
                    : "Get started by registering your first smart bin"
                  }
                </p>
                {!searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/register'}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    <Plus size={18} className="inline mr-2" />
                    Register First Bin
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedBins.map((bin, index) => {
                  const priority = getCollectionPriority(bin);
                  return (
                    <motion.div
                      key={bin.binId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all overflow-hidden"
                    >
                      {/* Header with Priority */}
                      <div className={`p-4 border-b ${
                        priority.level === 'high' ? 'bg-red-50 border-red-200' :
                        priority.level === 'medium' ? 'bg-orange-50 border-orange-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 capitalize text-lg">
                              {bin.binType} Bin
                            </h3>
                            <p className="text-sm text-gray-600 font-mono">{bin.binId}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            priority.level === 'high' ? 'bg-red-100 text-red-700' :
                            priority.level === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {priority.label}
                          </span>
                        </div>
                        
                        {/* Fill Level */}
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Fill Level</span>
                            <span className="font-semibold">{bin.fillLevel?.toFixed(0) || 0}%</span>
                          </div>
                          <FillLevelBar level={bin.fillLevel} />
                        </div>
                      </div>

                      {/* Bin Details */}
                      <div className="p-4 space-y-3">
                        {/* Resident & Owner Info */}
                        <div className="flex items-start gap-3">
                          <User size={16} className="text-gray-400 mt-1" />
                          <div className="w-full">
                            <p className="font-semibold text-gray-900">{bin.residentName}</p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Owner/Org:</span> {bin.ownerName || "—"}
                              {" · "}
                              <span className="font-medium">Type:</span> {bin.residentType || "—"}
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                              {bin.phone && <span className="flex items-center gap-1"><Phone size={12} /> {bin.phone}</span>}
                              {bin.email && <span className="flex items-center gap-1"><Mail size={12} /> {bin.email}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        {bin.location && (
                          <div className="flex items-center gap-3">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{bin.location}</span>
                          </div>
                        )}

                        {/* Collection Schedule */}
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600 capitalize">
                            {bin.collectionFrequency} collection
                          </span>
                        </div>

                        {/* Bin Specifications */}
                        <div className="flex gap-4 text-sm">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {bin.binSize}
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                            {bin.status || 'active'}
                          </span>
                        </div>
                      </div>

                      {/* QR Code and Actions */}
                      <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          {/* QR Code */}
                          <div className="flex items-center gap-3">
                            <div className="border rounded-lg p-1">
                              <QRCodeCanvas
                                id={`qr-${bin.binId}`}
                                value={bin.qrData || `BIN:${bin.binId}`}
                                size={60}
                                bgColor="#ffffff"
                                fgColor="#059669"
                                level="H"
                              />
                            </div>
                            <button
                              onClick={() => downloadQR(bin)}
                              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              <Download size={12} />
                              Download Sticker
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(bin)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit bin"
                            >
                              <Edit size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(bin.binId)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete bin"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Edit Modal */}
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
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Bin Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resident Name *
                  </label>
                  <input
                    type="text"
                    value={editBin.residentName || ""}
                    onChange={(e) => setEditBin({ ...editBin, residentName: e.target.value })}
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
                    onChange={(e) => setEditBin({ ...editBin, ownerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resident Type
                  </label>
                  <select
                    value={editBin.residentType || "house"}
                    onChange={(e) => setEditBin({ ...editBin, residentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="shop">Shop</option>
                    <option value="office">Office</option>
                    <option value="school">School</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={editBin.phone || ""}
                    onChange={(e) => setEditBin({ ...editBin, phone: e.target.value })}
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
                    onChange={(e) => setEditBin({ ...editBin, location: e.target.value })}
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
                      onChange={(e) => setEditBin({ ...editBin, binSize: e.target.value })}
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
                      Collection
                    </label>
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
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
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
        <p>© 2024 Smart Waste Management System | Building Sustainable Communities ♻️</p>
        <p className="mt-1 text-xs">Last updated: {new Date().toLocaleDateString()}</p>
      </motion.footer>
    </div>
  );
}
