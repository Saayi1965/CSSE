package com.csse.smartwaste.controller;
import com.csse.smartwaste.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public List<Object> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> {
                    return java.util.Map.of(
                            "id", u.getId(),
                            "username", u.getUsername(),
                            "role", u.getRole() == null ? null : u.getRole().name()
                    );
                })
                .collect(Collectors.toList());
    }
}
