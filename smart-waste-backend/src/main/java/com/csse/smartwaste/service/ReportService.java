package com.csse.smartwaste.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.csse.smartwaste.repository.CollectionRepository;
import com.csse.smartwaste.model.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
  private final CollectionRepository repo;

  public Map<String,Object> summary(LocalDate start, LocalDate end){
    List<Collection> data = repo.findByDateBetween(start,end);
    double total = data.stream().mapToDouble(Collection::getWeightKg).sum();
    Map<String,Long> byType = data.stream().collect(Collectors.groupingBy(Collection::getWasteType,Collectors.counting()));
    // simple recycling rate estimate: recyclables / total by count (placeholder)
    long recyclables = byType.entrySet().stream().filter(e->e.getKey().toLowerCase().contains("recycl")).mapToLong(java.util.Map.Entry::getValue).sum();
    int recyclingRate = data.isEmpty() ? 0 : (int)Math.round((recyclables * 100.0) / data.size());
    String avgPerArea = String.format("%s t", Math.round((total / Math.max(1, 4)) * 10.0) / 10.0); // placeholder per 4 areas
    return Map.of("totalWeight",total,"records",data.size(),"byType",byType,"recyclingRate",recyclingRate,"avgPerArea",avgPerArea);
  }

  public byte[] exportCsv(LocalDate start, LocalDate end){
    List<Collection> data = repo.findByDateBetween(start,end);
    var byType = data.stream().collect(Collectors.groupingBy(Collection::getWasteType, Collectors.counting()));
    StringBuilder lines = new StringBuilder("Type,Count\n");
    byType.forEach((t,c)->lines.append(t).append(',').append(c).append('\n'));
    return lines.toString().getBytes(StandardCharsets.UTF_8);
  }
}
