// src/components/QRSticker.jsx
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";

/**
 * Enhanced QR Sticker component (HD version + optional logo)
 *
 * Features:
 * - Higher resolution for print clarity
 * - Optional organization logo (top-right)
 * - Improved text alignment and spacing
 * - Auto-wrap for long text fields
 */
export default function QRSticker({
  bin,
  label,
  theme,
  size = { width: 400, height: 280 },
  showPreview = true,
  showQuotes = true,
  customQuotes,
  footerText = "Smart Waste Management System",
  logoUrl, // ✅ optional organization logo
}) {
  const qrRef = useRef(null);

  // --- Themes for each bin type
  const themes = {
    general: { color: "#64748B", label: "General Waste ♻️" },
    recyclable: { color: "#059669", label: "Recyclable Waste ♻️" },
    organic: { color: "#CA8A04", label: "Organic Waste 🌱" },
    plastic: { color: "#2563EB", label: "Plastic Waste 🧴" },
    electronic: { color: "#9333EA", label: "E-Waste ⚡" },
    hazardous: { color: "#DC2626", label: "Hazardous Waste ☣️" },
  };

  const t = theme || themes[bin?.binType] || themes.general;

  // ✅ Download sticker in HD
  const download = async () => {
    if (!bin?.binId) return;

    const width = size.width;
    const height = size.height;

    // Create HD canvas (2x scale)
    const scale = 2;
    const stickerCanvas = document.createElement("canvas");
    stickerCanvas.width = width * scale;
    stickerCanvas.height = height * scale;
    const ctx = stickerCanvas.getContext("2d");
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = t.color;
    ctx.fillRect(0, 0, width, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label || t.label, width / 2, 38);

    // Optional logo
    if (logoUrl) {
      const logo = new Image();
      logo.src = logoUrl;
      await new Promise((res) => (logo.onload = res));
      const logoSize = 40;
      ctx.drawImage(logo, width - logoSize - 15, 10, logoSize, logoSize);
    }

    // QR code
    const qrCanvas = qrRef.current?.querySelector("canvas");
    const qrSize = 130;
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 30, 90, qrSize, qrSize);
    }

    // Text info
    ctx.fillStyle = "#111827";
    ctx.textAlign = "left";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`Bin ID: ${bin.binId}`, 180, 110);

    ctx.font = "14px Arial";
    const lines = [
      `Resident: ${bin.residentName || "N/A"}`,
      `Owner: ${bin.ownerName || "N/A"}`,
      `Type: ${bin.residentType || "N/A"}`,
      `Location: ${bin.location || "N/A"}`,
      `Collection: ${bin.collectionFrequency || "weekly"}`,
    ];

    let y = 135;
    lines.forEach((line) => {
      wrapText(ctx, line, 180, y, width - 200, 16);
      y += 25;
    });

    // Quotes
    if (showQuotes) {
      const quotes =
        customQuotes && Array.isArray(customQuotes) && customQuotes.length
          ? customQuotes
          : [
              { icon: "♻️", text: "Keep your city clean" },
              { icon: "🌱", text: "ඔබේ නගරය පිරිසිදුව තබා ගන්න" },
              { icon: "🧹", text: "உங்கள் நகரத்தை சுத்தமாக வைத்திருங்கள்" },
            ];

      ctx.textAlign = "center";
      ctx.fillStyle = "#374151";
      ctx.font = "12px Arial";
      const baseY = height - 48;
      const lineGap = 14;
      quotes.slice(0, 3).forEach((q, i) => {
        ctx.fillText(`${q.icon}  ${q.text}`, width / 2, baseY + i * lineGap);
      });
    }

    // Footer
    ctx.font = "12px Arial";
    ctx.fillStyle = "#6B7280";
    ctx.textAlign = "center";
    ctx.fillText(footerText, width / 2, height - 12);

    // Download
    const imageUrl = stickerCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${bin.binType || "bin"}-Sticker-${bin.binId}.png`;
    link.click();
  };

  // ✅ Helper function for wrapping text
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Visible small QR preview */}
      {showPreview && (
        <div className="border rounded-lg p-1">
          <QRCodeCanvas
            value={bin?.qrData || ""}
            size={60}
            bgColor="#ffffff"
            fgColor={t.color}
            level="H"
          />
        </div>
      )}

      {/* Hidden QR renderer */}
      <div
        ref={qrRef}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      >
        <QRCodeCanvas
          value={bin?.qrData || ""}
          size={160}
          level="H"
          bgColor="#ffffff"
          fgColor={t.color}
        />
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
