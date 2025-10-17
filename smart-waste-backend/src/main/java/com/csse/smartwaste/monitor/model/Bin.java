package com.csse.smartwaste.monitor.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "bins")
public class Bin {

    @Id
    private String id;

    private String type;        // e.g., GENERAL, ORGANIC, RECYCLE
    private String area;        // human-friendly location
    private int level;          // 0..100
    private String status;      // EMPTY, HALF, FULL
    private Instant lastUpdated;

    public Bin() {}

    public Bin(String id, String type, String area, int level, String status, Instant lastUpdated) {
        this.id = id;
        this.type = type;
        this.area = area;
        this.level = level;
        this.status = status;
        this.lastUpdated = lastUpdated;
    }

    // --- Getters / Setters ---
    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getArea() {
        return area;
    }

    public int getLevel() {
        return level;
    }

    public String getStatus() {
        return status;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
