package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Collection;
import com.csse.smartwaste.service.CollectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/collect")
public class CollectionController {

    private final CollectService service;

    public CollectionController(CollectService service) {
        this.service = service;
    }

    // Record collection (called from frontend after QR scan)
    @PostMapping("/record")
    public ResponseEntity<?> record(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(service.recordCollection(body));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Collector’s pickup history
    @GetMapping("/my/{collectorId}")
    public List<Collection> getHistory(@PathVariable String collectorId) {
        return service.getCollectorHistory(collectorId);
    }

    // Manually empty bin
    @PutMapping("/empty/{binId}")
    public Map<String, Object> emptyBin(@PathVariable String binId) {
        return service.emptyBin(binId);
    }
}
