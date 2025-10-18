// src/components/QRSticker.jsx
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";

// Small, reusable component to render and download a QR "sticker" for a bin
// Props:
// - bin: { binId, binType, ownerName, residentName, location, collectionFrequency, qrData }
// - label (optional): override the title displayed on the sticker
// - theme (optional): override colors per bin type
// - size (optional): base width/height of the sticker canvas (default 400x280)
export default function QRSticker({
  bin,
  label,
  theme,
  size = { width: 400, height: 280 },
  showPreview = true, // show a small QR preview inline
  showQuotes = true,  // show trilingual quote block at bottom
  customQuotes,       // optional array of { text, icon }
  footerText = "Smart Waste Management System",
}) {
  const qrRef = useRef(null);

  const themes = {
    general: { color: "#64748B", label: "General Waste ♻️" },
    recyclable: { color: "#059669", label: "Recyclable Waste ♻️" },
    organic: { color: "#CA8A04", label: "Organic Waste 🌱" },
    plastic: { color: "#2563EB", label: "Plastic Waste 🧴" },
    electronic: { color: "#9333EA", label: "E-Waste ⚡" },
    hazardous: { color: "#DC2626", label: "Hazardous Waste ☣️" },
  };

  const t = theme || themes[bin?.binType] || themes.general;

  const download = () => {
    if (!bin?.binId) return;

    const stickerCanvas = document.createElement("canvas");
    const ctx = stickerCanvas.getContext("2d");
    const width = size.width;
    const height = size.height;
    stickerCanvas.width = width;
    stickerCanvas.height = height;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Header bar
    ctx.fillStyle = t.color;
    ctx.fillRect(0, 0, width, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label || t.label, width / 2, 38);

    // Draw QR from the hidden QR canvas
    const qrCanvas = qrRef.current?.querySelector("canvas");
    const qrSize = 130;
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 30, 90, qrSize, qrSize);
    }

    // Text fields
    ctx.fillStyle = "#111827";
    ctx.textAlign = "left";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`Bin ID: ${bin.binId}`, 180, 110);
    ctx.font = "14px Arial";
    ctx.fillText(`Resident: ${bin.residentName || "N/A"}`, 180, 135);
    ctx.fillText(`Owner: ${bin.ownerName || "N/A"}`, 180, 160);
    ctx.fillText(`Type: ${bin.residentType || "N/A"}`, 180, 185);
    ctx.fillText(`Location: ${bin.location || "N/A"}`, 180, 210);
    ctx.fillText(`Collection: ${bin.collectionFrequency || "weekly"}`, 180, 235);

    // Quotes (tri-lingual) with small icons
    if (showQuotes) {
      const quotes = customQuotes && Array.isArray(customQuotes) && customQuotes.length
        ? customQuotes
        : [
            { icon: "♻️", text: "Keep your city clean" },
            { icon: "🌱", text: "ඔබේ නගරය පිරිසිදුව තබා ගන්න" },
            { icon: "🧹", text: "உங்கள் நகரத்தை சுத்தமாக வைத்திருங்கள்" },
          ];

      ctx.textAlign = "center";
      ctx.fillStyle = "#374151"; // gray-700
      ctx.font = "12px Arial";
      const baseY = height - 46; // start a bit above footer
      const lineGap = 13;
      quotes.slice(0, 3).forEach((q, i) => {
        const y = baseY + i * lineGap;
        ctx.fillText(`${q.icon}  ${q.text}`, width / 2, y);
      });
    }

    // Footer
    ctx.font = "12px Arial";
    ctx.fillStyle = "#6B7280"; // gray-500
    ctx.textAlign = "center";
    ctx.fillText(footerText, width / 2, height - 12);

    // Download
    const imageUrl = stickerCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${bin.binType || "bin"}-Sticker-${bin.binId}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Visible small QR preview (for UI) */}
      {showPreview && (
        <div className="border rounded-lg p-1">
          <QRCodeCanvas
            value={bin?.qrData || ""}
            size={60}
            bgColor="#ffffff"
            fgColor="#059669"
            level="H"
          />
        </div>
      )}

      {/* Hidden QR renderer used for composition */}
      <div ref={qrRef} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}>
        <QRCodeCanvas value={bin?.qrData || ""} size={160} level="H" bgColor="#ffffff" fgColor={t.color} />
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={download}
        className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
      >
        Download QR Sticker
      </motion.button>
    </div>
  );
}
