package com.csse.smartwaste.monitor.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "alerts")
public class Alert {

    @Id
    private String id;

    private String binId;
    private String severity;   // e.g., "NEAR_FULL", "FULL"
    private String message;
    private Boolean isRead = false;
    private Instant createdAt = Instant.now();

    public Alert() {}

    public Alert(String binId, String severity, String message) {
        this.binId = binId;
        this.severity = severity;
        this.message = message;
        this.isRead = false;
        this.createdAt = Instant.now();
    }

    // --- Getters / Setters ---
    public String getId() {
        return id;
    }

    public String getBinId() {
        return binId;
    }

    public String getSeverity() {
        return severity;
    }

    public String getMessage() {
        return message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setBinId(String binId) {
        this.binId = binId;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
