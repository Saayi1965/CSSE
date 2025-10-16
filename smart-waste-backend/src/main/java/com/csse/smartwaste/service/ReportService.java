// src/main/java/com/csse/smartwaste/service/ReportService.java
package com.csse.smartwaste.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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