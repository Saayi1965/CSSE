package com.csse.smartwaste.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a waste collection record — can be used for
 * both analytics (region-based) and collector pickups (QR-based).
 */
@Document(collection = "collections")
public class Collection {

    @Id
    private String id;

    // 🌍 For analytics/reporting
    private String region;       // e.g., "Colombo"
    private String wasteType;    // e.g., "Plastic", "Organic"

    // ⚖️ Common info
    private double weightKg;     // e.g., 12.5
    private LocalDate date;      // e.g., 2025-10-17

    // 🚛 Optional: For collector tracking
    private String collectorId;  // e.g., "COLL_001" (used in frontend collector login)
    private String binCode;      // e.g., "BIN-001" (used for QR scan)
    private LocalDateTime collectedAt; // exact timestamp
    private String note;         // optional message (like “overflow handled”)

    // ✅ Constructors
    public Collection() {}

    public Collection(String region, String wasteType, double weightKg, LocalDate date) {
        this.region = region;
        this.wasteType = wasteType;
        this.weightKg = weightKg;
        this.date = date;
    }

    // ✅ Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getWasteType() { return wasteType; }
    public void setWasteType(String wasteType) { this.wasteType = wasteType; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getCollectorId() { return collectorId; }
    public void setCollectorId(String collectorId) { this.collectorId = collectorId; }

    public String getBinCode() { return binCode; }
    public void setBinCode(String binCode) { this.binCode = binCode; }

    public LocalDateTime getCollectedAt() { return collectedAt; }
    public void setCollectedAt(LocalDateTime collectedAt) { this.collectedAt = collectedAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
