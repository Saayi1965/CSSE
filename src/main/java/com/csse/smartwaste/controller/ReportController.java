package com.csse.smartwaste.controller;

import com.csse.smartwaste.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
  private final ReportService service;

  @GetMapping("/summary")
  public Map<String,Object> summary(
      @RequestParam String startDate, @RequestParam String endDate){
    return service.summary(LocalDate.parse(startDate), LocalDate.parse(endDate));
  }

  @GetMapping("/export")
  public ResponseEntity<byte[]> export(
      @RequestParam String startDate, @RequestParam String endDate){
    var bytes = service.exportCsv(LocalDate.parse(startDate), LocalDate.parse(endDate));
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.csv")
        .body(bytes);
  }
}
