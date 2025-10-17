package com.csse.smartwaste.monitor.controller;

import com.csse.smartwaste.monitor.model.Alert;
import com.csse.smartwaste.monitor.model.Bin;
import com.csse.smartwaste.monitor.model.QueueItem;
import com.csse.smartwaste.monitor.repository.AlertRepo;
import com.csse.smartwaste.monitor.repository.BinRepo;
import com.csse.smartwaste.monitor.repository.QueueRepo;
import com.csse.smartwaste.monitor.service.SimulatorService;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api")
public class MonitorController {

    private final BinRepo binRepo;
    private final AlertRepo alertRepo;
    private final QueueRepo queueRepo;
    private final SimulatorService simulatorService;

    public MonitorController(BinRepo binRepo,
                             AlertRepo alertRepo,
                             QueueRepo queueRepo,
                             SimulatorService simulatorService) {
        this.binRepo = binRepo;
        this.alertRepo = alertRepo;
        this.queueRepo = queueRepo;
        this.simulatorService = simulatorService;
    }

    // --------------------------
    // Bins
    // --------------------------
    @GetMapping("/bins")
    public List<Bin> bins() {
        return binRepo.findAll();
    }

    // --------------------------
    // Alerts
    // --------------------------

    /** All alerts (limit 50, newest first) */
    @GetMapping("/alerts")
    public List<Alert> alerts() {
        List<Alert> all = alertRepo.findAll();
        // Sort by createdAt desc, limit 50
        all.sort((a1, a2) -> {
            Instant d1 = a1.getCreatedAt();
            Instant d2 = a2.getCreatedAt();
            if (d1 == null && d2 == null) return 0;
            if (d1 == null) return 1;
            if (d2 == null) return -1;
            return d2.compareTo(d1);
        });
        return (all.size() > 50) ? all.subList(0, 50) : all;
    }

    /** Unread alerts + small summary */
    @GetMapping("/alerts/unread")
    public Map<String, Object> unread() {
        List<Alert> list = alertRepo.findTop10ByIsReadFalseOrderByCreatedAtDesc();
        Map<String, Object> res = new HashMap<>();
        res.put("count", list.size());
        res.put("items", list);
        res.put("queuePending", queueRepo.count());
        return res;
    }

    /** Mark top 10 unread alerts as read */
    @PostMapping("/alerts/mark-read")
    public Map<String, Object> markAllRead() {
        List<Alert> alerts = alertRepo.findTop10ByIsReadFalseOrderByCreatedAtDesc();
        for (Alert a : alerts) {
            a.setIsRead(true);
        }
        alertRepo.saveAll(alerts);
        Map<String, Object> res = new HashMap<>();
        res.put("updated", alerts.size());
        return res;
    }

    // --------------------------
    // Collection Queue
    // --------------------------
    @GetMapping("/queue")
    public List<QueueItem> queue() {
        return queueRepo.findAll();
    }

    // --------------------------
    // Simulator
    // --------------------------
    /** Advance one simulation tick and return updated snapshot */
    @PostMapping("/simulate/tick")
    public Map<String, Object> simulateTick() {
        Map<String, Object> res = new HashMap<>();
        try {
            List<Bin> updated = simulatorService.tick();   // returns updated bins
            res.put("ok", true);
            res.put("bins", updated);
            res.put("unreadAlerts", alertRepo.findTop10ByIsReadFalseOrderByCreatedAtDesc());
            res.put("queue", queueRepo.findAll());
        } catch (Exception ex) {
            res.put("ok", false);
            res.put("error", ex.getMessage());
        }
        return res;
    }

    // Basic health
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "UP");
        res.put("time", Instant.now().toString());
        res.put("bins", binRepo.count());
        res.put("alerts", alertRepo.count());
        res.put("queue", queueRepo.count());
        return res;
    }
}
