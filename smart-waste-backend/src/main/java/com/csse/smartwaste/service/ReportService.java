// src/main/java/com/csse/smartwaste/service/ReportService.java
package com.csse.smartwaste.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.csse.smartwaste.model.Collection;
import com.csse.smartwaste.repository.CollectionRepository;

@Service
public class ReportService {

    private final CollectionRepository repo;

    public ReportService(CollectionRepository repo) {
        this.repo = repo;
    }

    public double totalWeight(LocalDate from, LocalDate to) {
        List<Collection> list = repo.findByDateBetween(from, to);
        return list.stream().mapToDouble(c -> c.getWeightKg()).sum();
    }

    public Map<String, Double> weightByType(LocalDate from, LocalDate to) {
        List<Collection> list = repo.findByDateBetween(from, to);
        return list.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getWasteType(),
                        Collectors.summingDouble(c -> c.getWeightKg())
                ));
    }

    public Map<String, Long> countByType(LocalDate from, LocalDate to) {
        List<Collection> list = repo.findByDateBetween(from, to);
        return list.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getWasteType(),
                        Collectors.counting()
                ));
    }

    /** ✅ NEW: matches controller usage */
    public Map<String, Object> summary(LocalDate from, LocalDate to) {
        double total = totalWeight(from, to);
        Map<String, Double> byType = weightByType(from, to);
        Map<String, Long> count = countByType(from, to);

        return new LinkedHashMap<>() {{
            put("from", from.toString());
            put("to", to.toString());
            put("totalWeightKg", total);
            put("weightByType", byType);
            put("countByType", count);
        }};
    }

    /**
     * Return a list of report rows matching optional filters. The front-end expects
     * objects with keys: date, zone, user, vehicle, collected, recycled, status
     */
    public List<Map<String, Object>> listReports(LocalDate from, LocalDate to, Optional<String> zoneOpt, Optional<String> userOpt, Optional<String> vehicleOpt) {
        List<Collection> list = repo.findByDateBetween(from, to);

        return list.stream()
                .filter(c -> {
                    if (zoneOpt.isPresent() && !zoneOpt.get().isBlank() && !zoneOpt.get().equalsIgnoreCase("All")) {
                        String zone = zoneOpt.get();
                        String region = c.getRegion() == null ? "" : c.getRegion();
                        if (!region.toLowerCase().contains(zone.toLowerCase())) return false;
                    }
                    return true;
                })
                .map(c -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("date", c.getDate() != null ? c.getDate().toString() : "");
                    row.put("zone", c.getRegion());
                    row.put("user", userOpt.orElse(""));
                    row.put("vehicle", vehicleOpt.orElse(""));
                    row.put("collected", c.getWeightKg());
                    boolean recyclable = c.getWasteType() != null && c.getWasteType().toLowerCase().matches(".*(plastic|paper|metal|glass|recycl).*");
                    double recycled = c.getWeightKg() * (recyclable ? 0.7 : 0.05);
                    // round to 2 decimals
                    double recycledRounded = Math.round(recycled * 100.0) / 100.0;
                    row.put("recycled", recycledRounded);
                    row.put("status", "Completed");
                    return row;
                })
                .collect(Collectors.toList());
    }

    /**
     * Return a small array of metric objects suitable for the frontend chart component
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> summaryForChart(LocalDate from, LocalDate to) {
        Map<String, Object> s = summary(from, to);
        double total = 0.0;
        Object totObj = s.get("totalWeightKg");
        if (totObj instanceof Number) total = ((Number) totObj).doubleValue();
        Map<String, Double> byType = (Map<String, Double>) s.get("weightByType");
        int types = byType != null ? byType.size() : 0;
        int collections = repo.findByDateBetween(from, to).size();

        List<Map<String, Object>> out = new ArrayList<>();
        out.add(Map.of("metric", "Total Weight (kg)", "value", total));
        out.add(Map.of("metric", "Waste Types", "value", (double) types));
        out.add(Map.of("metric", "Collections", "value", (double) collections));
        return out;
    }

    /** ✅ NEW: matches controller usage; returns CSV bytes */
    public byte[] exportCsv(LocalDate from, LocalDate to) {
        List<Collection> list = repo.findByDateBetween(from, to);

        StringBuilder sb = new StringBuilder();
        sb.append("region,wasteType,weightKg,date\n");
        for (Collection c : list) {
            sb.append(escape(c.getRegion())).append(',')
              .append(escape(c.getWasteType())).append(',')
              .append(c.getWeightKg()).append(',')
              .append(c.getDate() != null ? c.getDate() : "").append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escape(String s) {
        if (s == null) return "";
        boolean needQuotes = s.contains(",") || s.contains("\"") || s.contains("\n");
        String v = s.replace("\"", "\"\"");
        return needQuotes ? "\"" + v + "\"" : v;
    }
}