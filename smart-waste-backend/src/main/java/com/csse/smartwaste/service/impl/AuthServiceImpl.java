package com.csse.smartwaste.service.impl;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.csse.smartwaste.model.Role;
import com.csse.smartwaste.model.User;
import com.csse.smartwaste.repository.UserRepository;
import com.csse.smartwaste.security.JwtUtil;
import com.csse.smartwaste.service.AuthService;

/**
 * Authentication service with an optional in-memory fallback used when
 * 'app.dev.inmemory' property is true. This lets you test register/login
 * without a running MongoDB instance. Production uses the Mongo-backed repo.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;
    private final boolean inMemory;

    // simple thread-safe in-memory user store: username -> User
    private final Map<String, User> inMemoryUsers = new ConcurrentHashMap<>();

    public AuthServiceImpl(UserRepository repo, PasswordEncoder encoder, JwtUtil jwt,
                           @Value("${app.dev.inmemory:false}") boolean inMemory) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
        this.inMemory = inMemory;
    }

    @Override
    public Map<String, Object> register(String username, String rawPassword, Role role) {
        if (inMemory) {
            if (inMemoryUsers.containsKey(username)) {
                throw new IllegalArgumentException("Username is already taken");
            }
            User u = new User(username, encoder.encode(rawPassword), role);
            // generate a pseudo-id for compatibility with JWT claims
            u.setId("inmem-" + Math.abs(username.hashCode()));
            inMemoryUsers.put(username, u);

            String token = jwt.generateToken(
                    u.getUsername(),
                    Map.of("role", u.getRole().name(), "uid", u.getId())
            );
            return Map.of(
                    "token", token,
                    "role", u.getRole().name(),
                    "username", u.getUsername()
            );
        }

        // Default: persist to MongoDB via repository
        if (repo.existsByUsername(username)) {
            throw new IllegalArgumentException("Username is already taken");
        }
        User u = new User(username, encoder.encode(rawPassword), role);
        repo.save(u);

        String token = jwt.generateToken(
                u.getUsername(),
                Map.of("role", u.getRole().name(), "uid", u.getId() == null ? "" : u.getId())
        );
        return Map.of(
                "token", token,
                "role", u.getRole().name(),
                "username", u.getUsername()
        );
    }

    @Override
    public Map<String, Object> login(String username, String rawPassword) {
        if (inMemory) {
            User u = Optional.ofNullable(inMemoryUsers.get(username))
                    .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

            if (!encoder.matches(rawPassword, u.getPassword())) {
                throw new IllegalArgumentException("Invalid username or password");
            }

            String token = jwt.generateToken(
                    u.getUsername(),
                    Map.of("role", u.getRole().name(), "uid", u.getId())
            );
            return Map.of(
                    "token", token,
                    "role", u.getRole().name(),
                    "username", u.getUsername()
            );
        }

        User u = repo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!encoder.matches(rawPassword, u.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwt.generateToken(
                u.getUsername(),
                Map.of("role", u.getRole().name(), "uid", u.getId() == null ? "" : u.getId())
        );
        return Map.of(
                "token", token,
                "role", u.getRole().name(),
                "username", u.getUsername()
        );
    }
}