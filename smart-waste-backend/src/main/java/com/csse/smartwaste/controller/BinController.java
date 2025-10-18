package com.csse.smartwaste.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.csse.smartwaste.model.Bin;

@RestController
@RequestMapping("/api/bins")
@CrossOrigin(origins = {"http://localhost:3000","http://127.0.0.1:3000"}, allowCredentials = "true", maxAge = 3600)
public class BinController {

    @GetMapping("")
    public List<Bin> list() {
        // Simple mock/sample data; replace with DB-backed data later
        return Arrays.asList(
            new Bin("B-101", "North Zone - Colombo", 78),
            new Bin("B-102", "South Zone - Dehiwala", 42),
            new Bin("B-103", "East Zone - Kandy", 93),
            new Bin("B-104", "West Zone - Galle", 12)
        );
    }
}
