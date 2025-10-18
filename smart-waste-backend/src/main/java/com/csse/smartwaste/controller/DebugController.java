package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Role;
import com.csse.smartwaste.model.User;
import com.csse.smartwaste.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public DebugController(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    /**
     * Inspect the current Spring Security Authentication from the context.
     */
    @GetMapping("/auth")
    public ResponseEntity<?> authInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return ResponseEntity.ok(Map.of("authenticated", false, "principal", "none"));
        }
        List<String> roles = auth.getAuthorities()
                .stream()
                .map(Object::toString)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
            Map.of(
                "principal", String.valueOf(auth.getPrincipal()),
                "authenticated", auth.isAuthenticated(),
                "name", auth.getName(),
                "authorities", roles
            )
        );
    }

    /**
     * Quick helper to encode a raw password to BCrypt, for manual seeding/testing.
     * Example: GET /api/debug/encode?raw=admin123
     */
    @GetMapping("/encode")
    public ResponseEntity<?> encode(@RequestParam("raw") String raw) {
        if (raw == null || raw.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "ok", false,
                    "error", "Provide ?raw=yourPassword"
            ));
        }
        String encoded = passwordEncoder.encode(raw);
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "raw", raw,
                "encoded", encoded
        ));
    }

    /**
     * Create a user (for dev/testing). Defaults to ADMIN role if not provided.
     * POST /api/debug/create-user
     * Body: { "username": "admin", "password": "admin123", "role": "ADMIN" }
     */
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> req) {
        String username = Optional.ofNullable(req.get("username")).orElse("").trim();
        String rawPassword = Optional.ofNullable(req.get("password")).orElse("").trim();
        String roleStr = Optional.ofNullable(req.get("role")).orElse("ADMIN").trim();

        if (username.isEmpty() || rawPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "ok", false,
                    "error", "username and password are required"
            ));
        }

        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "message", "User already exists",
                    "username", username
            ));
        }

        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (Exception e) {
            role = Role.ADMIN;
        }

        User u = new User();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRole(role);

        userRepository.save(u);

        return ResponseEntity.ok(Map.of(
                "ok", true,
                "message", "User created",
                "username", username,
                "role", role.name()
        ));
    }

    /**
     * (Optional) List users for debug.
     */
    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> data = users.stream().map(u -> Map.of(
                "id", Optional.ofNullable(u.getId()).orElse(""),
                "username", u.getUsername(),
                "role", u.getRole() != null ? u.getRole().name() : "UNKNOWN"
        )).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of(
                "count", data.size(),
                "items", data
        ));
    }
}
