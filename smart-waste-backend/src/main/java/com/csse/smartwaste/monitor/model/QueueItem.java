package com.csse.smartwaste.monitor.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "queue")
public class QueueItem {

    @Id
    private String id;

    private String binId;
    private String status = "PENDING";    // PENDING, COLLECTED, etc.
    private Instant queuedAt = Instant.now();

    public QueueItem() {}

    public QueueItem(String binId) {
        this.binId = binId;
        this.status = "PENDING";
        this.queuedAt = Instant.now();
    }

    // --- Getters / Setters ---
    public String getId() {
        return id;
    }

    public String getBinId() {
        return binId;
    }

    public String getStatus() {
        return status;
    }

    public Instant getQueuedAt() {
        return queuedAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setBinId(String binId) {
        this.binId = binId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setQueuedAt(Instant queuedAt) {
        this.queuedAt = queuedAt;
    }
}
