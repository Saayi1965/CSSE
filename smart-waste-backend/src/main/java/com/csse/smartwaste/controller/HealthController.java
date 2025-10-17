package com.csse.smartwaste.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok().body(java.util.Map.of("status", "ok"));
    }
     @GetMapping("/api/health")
  public Map<String, Object> health() {
    return Map.of("status", "OK");
  }
}
