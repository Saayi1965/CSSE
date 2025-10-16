package com.csse.smartwaste.service.impl;

import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.csse.smartwaste.model.Role;
import com.csse.smartwaste.model.User;
import com.csse.smartwaste.repository.UserRepository;
import com.csse.smartwaste.security.JwtUtil;
import com.csse.smartwaste.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthServiceImpl(UserRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Override
    public Map<String, Object> register(String username, String rawPassword, Role role) {
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