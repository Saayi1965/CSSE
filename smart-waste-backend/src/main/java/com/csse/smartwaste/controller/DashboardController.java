package com.csse.smartwaste.controller;

import com.csse.smartwaste.repository.CollectionRepository;
import com.csse.smartwaste.repository.UserRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/admin")
public class DashboardController {
    private final CollectionRepository collectionRepository;
    private final UserRepository userRepository;

    public DashboardController(CollectionRepository collectionRepository, UserRepository userRepository) {
        this.collectionRepository = collectionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/overview")
    public Map<String, Object> overview(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (to == null) to = LocalDate.now();
        if (from == null) from = to.minusMonths(6).withDayOfMonth(1);

        List<com.csse.smartwaste.model.Collection> cols = collectionRepository.findByDateBetween(from, to);

        double totalKg = cols.stream().mapToDouble(com.csse.smartwaste.model.Collection::getWeightKg).sum();
        long activeZones = cols.stream().map(com.csse.smartwaste.model.Collection::getRegion).filter(Objects::nonNull).distinct().count();

        Map<String, Double> byType = cols.stream().collect(Collectors.groupingBy(com.csse.smartwaste.model.Collection::getWasteType, Collectors.summingDouble(com.csse.smartwaste.model.Collection::getWeightKg)));

        // recycling rate: assume types named 'Recyclable' or common recyclable types ; compute recyclable kg / total
        double recyclableKg = byType.entrySet().stream()
                .filter(e -> {
                    String k = e.getKey() == null ? "" : e.getKey().toLowerCase();
                    return k.contains("plastic") || k.contains("paper") || k.contains("metal") || k.contains("glass") || k.contains("recycl");
                })
                .mapToDouble(Map.Entry::getValue).sum();

        double recyclingRate = totalKg == 0 ? 0.0 : (recyclableKg / totalKg) * 100.0;

        // monthly trend
        Map<YearMonth, Double> monthly = new TreeMap<>();
        LocalDate cursor = from.withDayOfMonth(1);
        while (!cursor.isAfter(to)) {
            monthly.put(YearMonth.from(cursor), 0.0);
            cursor = cursor.plusMonths(1);
        }
        cols.forEach(c -> {
            YearMonth ym = YearMonth.from(c.getDate());
            monthly.computeIfPresent(ym, (k, v) -> v + c.getWeightKg());
        });

        List<Map<String, Object>> monthlyTrend = monthly.entrySet().stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("month", e.getKey().toString());
            m.put("weightKg", e.getValue());
            return m;
        }).collect(Collectors.toList());

        long userCount = userRepository.count();

        Map<String, Object> out = new HashMap<>();
        out.put("totalKg", totalKg);
        out.put("recyclingRate", Math.round(recyclingRate * 100.0) / 100.0);
        out.put("activeZones", activeZones);
        out.put("userCount", userCount);
        out.put("monthlyTrend", monthlyTrend);
        out.put("byType", byType);

        // missed pickups placeholder (requires separate data model); returning 0
        out.put("missedPickups", 0);

        return out;
    }

    @GetMapping(value = "/report.csv")
    public ResponseEntity<byte[]> reportCsv(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Map<String, Object> overview = overview(from, to);

        StringBuilder sb = new StringBuilder();
        sb.append("Month,WeightKg\n");
        List<Map<String,Object>> monthly = (List<Map<String,Object>>) overview.getOrDefault("monthlyTrend", List.of());
        for (Map<String,Object> m : monthly) {
            sb.append(m.get("month")).append(',').append(m.get("weightKg")).append('\n');
        }
        sb.append('\n');
        sb.append("WasteType,WeightKg\n");
        Map<String,Double> byType = (Map<String,Double>) overview.getOrDefault("byType", Map.of());
        for (var e : byType.entrySet()) {
            sb.append(e.getKey()).append(',').append(e.getValue()).append('\n');
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.csv");

        return ResponseEntity.ok().headers(headers).body(bytes);
    }
}
