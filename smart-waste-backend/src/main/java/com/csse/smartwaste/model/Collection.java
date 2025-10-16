// src/main/java/com/csse/smartwaste/model/Collection.java
package com.csse.smartwaste.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "collections")
public class Collection {
    @Id
    private String id;

    private String region;      // e.g., "Colombo"
    private String wasteType;   // e.g., "Plastic", "Organic"
    private double weightKg;    // e.g., 12.5
    private LocalDate date;     // collection date

    public Collection() {}

    public Collection(String region, String wasteType, double weightKg, LocalDate date) {
        this.region = region;
        this.wasteType = wasteType;
        this.weightKg = weightKg;
        this.date = date;
    }

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
}