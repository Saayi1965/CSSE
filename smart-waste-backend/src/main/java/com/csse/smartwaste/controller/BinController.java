package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.repository.BinRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/bins")
public class BinController {

    private final BinRepository repo;

    public BinController(BinRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Bin> getAllBins() {
        return repo.findAll();
    }

    @PutMapping("/empty/{binId}")
    public Map<String, Object> emptyBin(@PathVariable String binId) {
        Bin bin = repo.findById(binId)
                .orElseThrow(() -> new RuntimeException("Bin not found"));
        bin.setStatus("Empty");
        bin.setFillLevel(0);
        repo.save(bin);
        return Map.of("message", "Bin emptied successfully", "binId", binId);
    }
}
