package com.csse.smartwaste.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @GetMapping("/auth")
    public ResponseEntity<?> authInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return ResponseEntity.ok("no-auth");
        }
        var roles = auth.getAuthorities().stream().map(Object::toString).collect(Collectors.toList());
        return ResponseEntity.ok(
            java.util.Map.of(
                "principal", auth.getPrincipal(),
                "authenticated", auth.isAuthenticated(),
                "name", auth.getName(),
                "authorities", roles
            )
        );
    }
}
