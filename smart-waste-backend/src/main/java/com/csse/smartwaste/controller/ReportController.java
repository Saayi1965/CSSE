// src/main/java/com/csse/smartwaste/controller/ReportController.java
package com.csse.smartwaste.controller;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.csse.smartwaste.service.ReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000","http://127.0.0.1:3000"}, allowCredentials = "true", maxAge = 3600)
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> summary(@RequestParam Optional<String> from, @RequestParam Optional<String> to) {
        LocalDate f = from.map(LocalDate::parse).orElse(LocalDate.now().minusDays(30));
        LocalDate t = to.map(LocalDate::parse).orElse(LocalDate.now());
        Map<String,Object> payload = service.summary(f, t);
        return ResponseEntity.ok(payload);
    }

    @GetMapping(value="/export", produces = "text/csv")
    public ResponseEntity<byte[]> export(@RequestParam Optional<String> from, @RequestParam Optional<String> to) {
        LocalDate f = from.map(LocalDate::parse).orElse(LocalDate.now().minusDays(30));
        LocalDate t = to.map(LocalDate::parse).orElse(LocalDate.now());
        byte[] csv = service.exportCsv(f, t);
        String filename = "report_" + f + "_" + t + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .body(csv);
    }
}