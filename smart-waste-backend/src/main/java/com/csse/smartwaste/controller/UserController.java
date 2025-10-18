package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Role;
import com.csse.smartwaste.model.User;
import com.csse.smartwaste.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // List all users (summary view)
    @GetMapping("/users")
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", u.getId());
                    m.put("username", u.getUsername());
                    m.put("role", u.getRole() == null ? null : u.getRole().name());
                    m.put("status", "active");
                    return m;
                })
                .collect(Collectors.toList());
    }

    // Get single user by id
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        Optional<User> u = userRepository.findById(id);
        if (u.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        User user = u.get();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "role", user.getRole() == null ? null : user.getRole().name()
        ));
    }

    // Create new user
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String roleStr = body.get("role");
        if (username == null || username.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "username required"));

        // simple uniqueness check
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "username exists"));
        }

        Role role = null;
        if (roleStr != null) {
            try { role = Role.valueOf(roleStr); } catch (Exception e) { role = null; }
        }

        User u = new User();
        u.setUsername(username);
        u.setRole(role);
        // no password handling here (would normally be required)
        User saved = userRepository.save(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId(),
                "username", saved.getUsername(),
                "role", saved.getRole() == null ? null : saved.getRole().name()
        ));
    }

    // Update user
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        User u = opt.get();
        if (body.containsKey("username")) u.setUsername(body.get("username"));
        if (body.containsKey("role")) {
            try { u.setRole(Role.valueOf(body.get("role"))); } catch (Exception e) { /* ignore invalid role */ }
        }
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
