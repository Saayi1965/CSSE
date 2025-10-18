// src/main/java/com/csse/smartwaste/controller/ReportController.java
package com.csse.smartwaste.controller;

import java.time.LocalDate;
import java.util.LinkedHashMap;
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
import com.csse.smartwaste.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000","http://127.0.0.1:3000"}, allowCredentials = "true", maxAge = 3600)
public class ReportController {

    private final ReportService service;
    private MailService mailService; // optional

    public ReportController(ReportService service) {
        this.service = service;
    }

    @Autowired(required = false)
    public void setMailService(MailService mailService) {
        this.mailService = mailService;
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

    @GetMapping(value = "/export/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestParam Optional<String> from, @RequestParam Optional<String> to) {
        java.time.LocalDate f = from.map(java.time.LocalDate::parse).orElse(java.time.LocalDate.now().minusDays(30));
        java.time.LocalDate t = to.map(java.time.LocalDate::parse).orElse(java.time.LocalDate.now());
        byte[] pdf = service.exportPdf(f, t);
        if (pdf == null) {
            return ResponseEntity.status(500).body(null);
        }
        String filename = "report_" + f + "_" + t + ".pdf";
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename).contentType(org.springframework.http.MediaType.APPLICATION_PDF).body(pdf);
    }

    // New: list reports with optional filters and also return summary for charts
    @GetMapping("")
    public ResponseEntity<?> list(
            @RequestParam Optional<String> from,
            @RequestParam Optional<String> to,
            @RequestParam Optional<String> zone,
            @RequestParam Optional<String> user,
            @RequestParam Optional<String> vehicle
    ) {
        LocalDate f = from.map(LocalDate::parse).orElse(LocalDate.now().minusDays(30));
        LocalDate t = to.map(LocalDate::parse).orElse(LocalDate.now());

        var reports = service.listReports(f, t, zone, user, vehicle);
        var summary = service.summaryForChart(f, t);

        return ResponseEntity.ok(new LinkedHashMap<String, Object>() {{
            put("reports", reports);
            put("summary", summary);
        }});
    }

    @PostMapping(path = "/email", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> emailReport(@RequestBody Map<String,String> body) {
        String to = body.get("to");
        String from = body.get("from");
        String toDate = body.get("to");
        String subject = body.getOrDefault("subject", "Smart Waste Report");

        // for simplicity, reuse CSV export as PDF bytes by calling service.exportPdf if available
        if (this.mailService == null) {
            return ResponseEntity.status(501).body(Map.of("error","email_not_configured","message","Mail server is not configured on the backend"));
        }

        try {
            byte[] pdf = service.exportPdf(body.get("from") != null ? java.time.LocalDate.parse(body.get("from")) : java.time.LocalDate.now().minusDays(30),
                    body.get("to") != null ? java.time.LocalDate.parse(body.get("to")) : java.time.LocalDate.now());
            if (pdf == null) return ResponseEntity.status(500).body(Map.of("error","pdf_not_supported"));

            // send asynchronously
            mailService.sendPdfAsync(to, subject, "Please find attached the requested report.", pdf, "report.pdf");
            return ResponseEntity.status(202).body(Map.of("status","queued"));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error","send_failed","message",ex.getMessage()));
        }
    }
}