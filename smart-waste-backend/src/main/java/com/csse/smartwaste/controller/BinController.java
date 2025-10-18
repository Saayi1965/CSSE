package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.service.BinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bins")
@CrossOrigin(origins = "http://localhost:5173")
public class BinController {

    private final BinService binService;

    public BinController(BinService binService) {
        this.binService = binService;
    }

    // ✅ Register a new bin
    @PostMapping("/register")
    public ResponseEntity<?> registerBin(@RequestBody Bin bin) {
        try {
            Bin saved = binService.registerBin(bin);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error registering bin");
        }
    }

    // ✅ Get all bins
    @GetMapping
    public ResponseEntity<List<Bin>> getAllBins() {
        return ResponseEntity.ok(binService.getAllBins());
    }

    // ✅ Get bin by Mongo _id or binId
    @GetMapping("/{id}")
    public ResponseEntity<Bin> getBinById(@PathVariable String id) {
        Bin bin = binService.getBinById(id);
        return bin != null ? ResponseEntity.ok(bin) : ResponseEntity.notFound().build();
    }

    // ✅ Update bin by ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBin(@PathVariable String id, @RequestBody Bin updatedBin) {
        try {
            Bin saved = binService.updateBin(id, updatedBin);
            return saved != null ? ResponseEntity.ok(saved) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating bin");
        }
    }

    // ✅ Delete bin by ID or binId
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBin(@PathVariable String id) {
        try {
            binService.deleteBin(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting bin");
        }
    }

    // ✅ Find bins by ownerId
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Bin>> getBinsByOwnerId(@PathVariable String ownerId) {
        return ResponseEntity.ok(binService.getBinsByOwnerId(ownerId));
    }

    // ✅ Find bins by owner name
    @GetMapping("/owner/name/{name}")
    public ResponseEntity<List<Bin>> getBinsByOwnerName(@PathVariable String name) {
        return ResponseEntity.ok(binService.getBinsByOwnerName(name));
    }

    // ✅ Find bins by email
    @GetMapping("/email/{email}")
    public ResponseEntity<List<Bin>> getBinsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(binService.getBinsByEmail(email));
    }

    // ✅ Find bin by QR (used by Collector scanning)
    @GetMapping("/scan/{qrData}")
    public ResponseEntity<?> getBinByQr(@PathVariable String qrData) {
        return binService.getBinByQrData(qrData)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Find bins by type and frequency
    @GetMapping("/filter")
    public ResponseEntity<List<Bin>> getBinsByTypeAndFrequency(
            @RequestParam String binType,
            @RequestParam String collectionFrequency) {
        return ResponseEntity.ok(binService.getBinsByTypeAndFrequency(binType, collectionFrequency));
    }

    // ✅ Geo range search (for map view)
    @GetMapping("/nearby")
    public ResponseEntity<List<Bin>> getNearbyBins(
            @RequestParam double latMin,
            @RequestParam double latMax,
            @RequestParam double lngMin,
            @RequestParam double lngMax) {
        return ResponseEntity.ok(binService.getBinsInRange(latMin, latMax, lngMin, lngMax));
    }

    // ✅ Update monitoring level (for collectors)
    @PutMapping("/level/{binId}")
    public ResponseEntity<?> updateBinLevel(@PathVariable String binId, @RequestParam int level) {
        try {
            Bin updated = binService.updateBinLevel(binId, level);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating bin level");
        }
    }

    // ✅ Check if bin exists (for validation)
    @GetMapping("/exists/bin/{binId}")
    public ResponseEntity<Boolean> existsByBinId(@PathVariable String binId) {
        return ResponseEntity.ok(binService.existsByBinId(binId));
    }

    @GetMapping("/exists/qr/{qrData}")
    public ResponseEntity<Boolean> existsByQrData(@PathVariable String qrData) {
        return ResponseEntity.ok(binService.existsByQrData(qrData));
    }
}
