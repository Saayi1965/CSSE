package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.service.BinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bins")
@CrossOrigin(origins = "http://localhost:5173") // frontend port
public class BinController {

    private final BinService binService;

    public BinController(BinService binService) {
        this.binService = binService;
    }

    @PostMapping("/register")
    public ResponseEntity<Bin> registerBin(@RequestBody Bin bin) {
        Bin saved = binService.registerBin(bin);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Bin>> getAllBins() {
        return ResponseEntity.ok(binService.getAllBins());
    }
}
