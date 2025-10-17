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

    @GetMapping
    public ResponseEntity<List<Bin>> getAllBins() {
        return ResponseEntity.ok(binService.getAllBins());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bin> getBinById(@PathVariable String id) {
        Bin bin = binService.getBinById(id);
        return bin != null ? ResponseEntity.ok(bin) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bin> updateBin(@PathVariable String id, @RequestBody Bin updatedBin) {
        Bin saved = binService.updateBin(id, updatedBin);
        return saved != null ? ResponseEntity.ok(saved) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBin(@PathVariable String id) {
        binService.deleteBin(id);
        return ResponseEntity.noContent().build();
    }
}
