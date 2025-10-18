// src/pages/BinRegister.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import Header from "../components/SiteHeader";
import api from "../api/api";
import "leaflet/dist/leaflet.css";

// ✅ Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ✅ Custom bin icon
const binIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ✅ Default form values
const defaultForm = {
  ownerId: localStorage.getItem("userId") || "",
  ownerName: localStorage.getItem("username") || "",
  residentType: "House",
  residentName: "",
  email: localStorage.getItem("email") || "",
  phone: "",
  binType: "general",
  binSize: "medium",
  location: "",
  address: "",
  latitude: null,
  longitude: null,
  collectionFrequency: "weekly",
  status: "ACTIVE",
  level: 0,
  monitorStatus: "EMPTY",
};

export default function BinRegister() {
  const navigate = useNavigate();
  const [bins, setBins] = useState([]);
  const [loadingBins, setLoadingBins] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultForm);
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const usernameLower = (localStorage.getItem("username") || "").toLowerCase();

  // ✅ Fetch bins (only if authenticated)
  useEffect(() => {
    const fetchBins = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadingBins(false);
          return; // Not logged in; avoid 401 redirect loop
        }
        const username = localStorage.getItem("username") || "";
        const res = await api.get(`/bins?ownerName=${encodeURIComponent(username)}`);
        setBins(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("⚠️ Failed to fetch bins.");
      } finally {
        setLoadingBins(false);
      }
    };
    fetchBins();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Map marker
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setFormData({
          ...formData,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          location: `Auto-detected at ${e.latlng.lat.toFixed(
            5
          )}, ${e.latlng.lng.toFixed(5)}`,
        });
        toast.success("📍 Location pinned!");
      },
    });
    return formData.latitude ? (
      <Marker
        position={[formData.latitude, formData.longitude]}
        icon={binIcon}
      />
    ) : null;
  }

  // ✅ Auto-center map
  function MapAutoCenter() {
    const map = useMapEvents({});
    useEffect(() => {
      if (formData.latitude && formData.longitude)
        map.flyTo([formData.latitude, formData.longitude], 16);
    }, [formData.latitude, formData.longitude]);
    return null;
  }

  // ✅ Geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    toast.loading("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        const { latitude, longitude } = pos.coords;
        setFormData({
          ...formData,
          latitude,
          longitude,
          location: `Auto-detected at ${latitude.toFixed(
            5
          )}, ${longitude.toFixed(5)}`,
        });
        toast.success("📍 Location detected!");
      },
      (err) => {
        toast.dismiss();
        console.error(err);
        toast.error("❌ Unable to detect location");
      }
    );
  };

  // ✅ Generate Bin ID
  const generateBinId = () => {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 5);
    return `BIN-${ts}-${rand}`.toUpperCase();
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      "ownerName",
      "residentName",
      "email",
      "phone",
      "latitude",
      "longitude",
    ];
    if (required.find((f) => !formData[f])) {
      toast.error("⚠️ Please fill all required fields.");
      return;
    }
    if (!formData.phone.match(/^\+?[\d\s-()]{10,}$/)) {
      toast.error("📱 Invalid phone number");
      return;
    }

    setIsSubmitting(true);
    const binId = generateBinId();

    const newBin = {
      ...formData,
      binId,
      registrationDate: new Date().toISOString(),
      status: "ACTIVE",
      level: 0,
      monitorStatus: "EMPTY",
      nextCollection: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      qrData: `SMARTWASTE:${binId}:${formData.binType}:${formData.latitude.toFixed(
        6
      )}:${formData.longitude.toFixed(6)}`,
    };

    try {
  await api.post("/bins/register", newBin);
      toast.success("🎉 Bin registered!");
      setBins((p) => [...p, newBin]);
      setTimeout(() => navigate("/bin-dashboard"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to register bin.");
    } finally {
      setIsSubmitting(false);
      setFormData(defaultForm);
      setCurrentStep(1);
    }
  };

  const nextStep = () => {
    if (
      currentStep === 1 &&
      (!formData.ownerName ||
        !formData.residentName ||
        !formData.email ||
        !formData.phone)
    ) {
      toast.error("⚠️ Please complete personal info");
      return;
    }
    setCurrentStep((p) => p + 1);
  };
  const prevStep = () => setCurrentStep((p) => p - 1);

  const StepHeader = ({ icon, title }) => (
    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
        <span className="text-emerald-600">{icon}</span>
      </div>
      {title}
    </h3>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col w-full">
        <div className="flex-grow bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center px-4 py-8 w-full">
          <Toaster position="top-right" />
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🗑️</span>
              </div>
              Register Smart Bin
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Register your waste bin for smart monitoring and efficient
              collection.
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-full max-w-4xl mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      s <= currentStep
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-24 h-1 mx-2 ${
                        s < currentStep ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600 px-2">
              <span
                className={
                  currentStep >= 1 ? "font-semibold text-emerald-600" : ""
                }
              >
                Personal Info
              </span>
              <span
                className={
                  currentStep >= 2 ? "font-semibold text-emerald-600" : ""
                }
              >
                Bin Details
              </span>
              <span
                className={
                  currentStep === 3 ? "font-semibold text-emerald-600" : ""
                }
              >
                Location
              </span>
            </div>
          </div>

          {/* ==== FORM ==== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white shadow-2xl rounded-3xl p-6 md:p-8 w-full max-w-4xl border border-emerald-100"
          >
            {!isLoggedIn && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                You are not logged in. Please log in to register a bin.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1 – Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <StepHeader icon="👤" title="Personal Information" />
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Owner / Organization *
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Resident Type *
                      </label>
                      <select
                        name="residentType"
                        value={formData.residentType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option>House</option>
                        <option>Shop</option>
                        <option>Apartment</option>
                        <option>School</option>
                        <option>Office</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="residentName"
                        value={formData.residentName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+94 71 123 4567"
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Collection Frequency *
                      </label>
                      <select
                        name="collectionFrequency"
                        value={formData.collectionFrequency}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 – Bin Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <StepHeader icon="🗑️" title="Bin Specifications" />
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Waste Type *
                      </label>
                      <select
                        name="binType"
                        value={formData.binType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="general">General Waste</option>
                        <option value="recyclable">Recyclable</option>
                        <option value="organic">Organic</option>
                        <option value="plastic">Plastic</option>
                        <option value="electronic">E-Waste</option>
                        <option value="hazardous">Hazardous</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Bin Size *
                      </label>
                      <select
                        name="binSize"
                        value={formData.binSize}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="small">Small (50 L)</option>
                        <option value="medium">Medium (120 L)</option>
                        <option value="large">Large (240 L)</option>
                        <option value="commercial">Commercial (1000 L+)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">
                      Location Description
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Near gate, Block A, Parking lot"
                      className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">
                      Full Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street, City, Postal Code"
                      className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3 – Map Pin */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <StepHeader icon="📍" title="Pin Your Bin Location" />
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <p className="font-semibold text-amber-800 mb-1">
                      💡 Tip:
                    </p>
                    <p className="text-amber-700 text-sm">
                      Click on the map to place your bin marker accurately or use your current location.
                    </p>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={getCurrentLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      📍 Use My Location
                    </motion.button>
                    {formData.latitude && (
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg">
                        ✅ Location Set
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl overflow-hidden border-2 border-emerald-200 shadow-lg">
                    <MapContainer
                      center={[6.9271, 79.8612]}
                      zoom={13}
                      style={{ height: "400px", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker />
                      <MapAutoCenter />
                    </MapContainer>
                  </div>

                  {formData.latitude && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <p className="text-emerald-700 font-semibold">
                        📍 Selected Coordinates:
                      </p>
                      <p className="text-emerald-600">
                        Latitude: {formData.latitude.toFixed(6)}, Longitude: 
                        {formData.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-8 py-3 rounded-xl font-semibold transition ${
                    currentStep === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  }`}
                >
                  ← Previous
                </motion.button>

                {currentStep < 3 ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={nextStep}
                    className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600"
                  >
                    Next →
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isSubmitting || !formData.latitude || !isLoggedIn}
                    className={`px-8 py-3 rounded-xl font-semibold transition ${
                      isSubmitting || !formData.latitude || !isLoggedIn
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg text-white"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Registering…
                      </span>
                    ) : !isLoggedIn ? (
                      "🔒 Login required"
                    ) : (
                      "✅ Register Bin"
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>

          {/* ==== Registered Bins (my bins only) ==== */}
          {!loadingBins && bins.filter((b) => (b.ownerName || "").toLowerCase() === usernameLower).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 w-full max-w-6xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                  Your Registered Bins ({bins.filter((b) => (b.ownerName || "").toLowerCase() === usernameLower).length})
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/bin-dashboard")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg"
                >
                  📊 View Dashboard
                </motion.button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bins
                  .filter((b) => (b.ownerName || "").toLowerCase() === usernameLower)
                  .map((bin, i) => (
                  <motion.div
                    key={bin.binId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-emerald-700 capitalize">
                        {bin.binType} Bin
                      </h3>
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-semibold">
                        {bin.binSize}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>ID:</strong> {bin.binId}</p>
                      <p><strong>Owner:</strong> {bin.ownerName}</p>
                      <p><strong>Status:</strong> {bin.status}</p>
                      <p><strong>Fill Level:</strong> {bin.level}%</p>
                      <p><strong>Monitor:</strong> {bin.monitorStatus}</p>
                      <p><strong>Location:</strong> {bin.location || "Not specified"}</p>
                      <p><strong>Frequency:</strong> {bin.collectionFrequency}</p>
                      <p className="text-xs text-gray-500">
                        Registered: {new Date(bin.registrationDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-center border-t pt-4">
                      <p className="text-xs text-gray-500 mb-2">Scan for bin info</p>
                      <QRCodeCanvas
                        value={bin.qrData}
                        size={80}
                        bgColor="#ffffff"
                        fgColor="#059669"
                        level="H"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <footer className="w-full bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Smart Waste Management System | Designed by Group 13 🌿
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
