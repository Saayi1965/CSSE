package com.csse.smartwaste.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.time.LocalDateTime;

@Document(collection = "bins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bin {

    // -------- Identity --------
    @Id
    private String id; // MongoDB _id

    @Indexed(unique = true)
    private String binId; // e.g., BIN-K9C8L-TQZ

    @Indexed
    private String ownerId; // linked to user's Mongo _id

    // -------- Resident Registration --------
    private String ownerName;
    private String residentType;
    private String residentName;
    private String email;
    private String phone;
    private String binType;
    private String binSize;
    private String location;
    private String address;
    private String collectionFrequency;
    private Double latitude;
    private Double longitude;
    private String qrData;
    private String status;
    private LocalDateTime registrationDate;
    private LocalDateTime nextCollection;

    // -------- Monitoring Fields --------
    private int level = 0; // fill %
    private String monitorStatus = "EMPTY"; // EMPTY / HALF / FULL
    private Instant lastUpdated = Instant.now();

    @LastModifiedDate
    private LocalDateTime lastModified;

    // -------- Helper Methods --------
    public void prepareForSave() {
        // Ensure readable location
        if (location == null || location.isEmpty()) {
            location = String.format("Auto-detected at %.5f, %.5f", latitude, longitude);
        }

        // Generate QR data
        if (qrData == null || qrData.isEmpty()) {
            qrData = String.format("SMARTWASTE:%s:%s:%.6f:%.6f",
                    binId, binType, latitude, longitude);
        }

        if (status == null) status = "ACTIVE";
        if (registrationDate == null) registrationDate = LocalDateTime.now();
        if (nextCollection == null) nextCollection = LocalDateTime.now().plusWeeks(1);
        if (monitorStatus == null) monitorStatus = "EMPTY";
        if (lastUpdated == null) lastUpdated = Instant.now();
    }

    // Helper for updating fill level
    public void updateLevel(int newLevel) {
        if (newLevel < 0) newLevel = 0;
        if (newLevel > 100) newLevel = 100;
        this.level = newLevel;

        if (newLevel == 0) this.monitorStatus = "EMPTY";
        else if (newLevel < 50) this.monitorStatus = "LOW";
        else if (newLevel < 80) this.monitorStatus = "HALF";
        else this.monitorStatus = "FULL";

        this.lastUpdated = Instant.now();
    }
}
