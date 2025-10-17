package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.service.BinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bins")
@CrossOrigin(origins = "http://localhost:5173") // ✅ Adjust to your frontend port
public class BinController {

    private final BinService binService;

    public BinController(BinService binService) {
        this.binService = binService;
    }

    // ✅ Register a new bin
    @PostMapping("/register")
    public ResponseEntity<Bin> registerBin(@RequestBody Bin bin) {
        Bin saved = binService.registerBin(bin);
        return ResponseEntity.ok(saved);
    }

    // ✅ Get all bins
    @GetMapping
    public ResponseEntity<List<Bin>> getAllBins() {
        return ResponseEntity.ok(binService.getAllBins());
    }

    // ✅ Get a bin by ID or binId
    @GetMapping("/{id}")
    public ResponseEntity<Bin> getBinById(@PathVariable String id) {
        Bin bin = binService.getBinById(id);
        return bin != null ? ResponseEntity.ok(bin) : ResponseEntity.notFound().build();
    }

    // ✅ Update a bin (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Bin> updateBin(@PathVariable String id, @RequestBody Bin updatedBin) {
        Bin saved = binService.updateBin(id, updatedBin);
        return saved != null ? ResponseEntity.ok(saved) : ResponseEntity.notFound().build();
    }

    // ✅ Delete a bin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBin(@PathVariable String id) {
        binService.deleteBin(id);
        return ResponseEntity.noContent().build();
    }
}
