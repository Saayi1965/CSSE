// package com.csse.smartwaste.service;

// import com.csse.smartwaste.model.Role;
// import com.csse.smartwaste.model.User;
// import com.csse.smartwaste.repository.UserRepository;
// import com.csse.smartwaste.security.JwtUtil;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;

// import java.util.Map;

// @Service
// public class AuthService {
//     private final UserRepository userRepository;
//     private final PasswordEncoder passwordEncoder;
//     private final JwtUtil jwtUtil;

//     public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
//         this.userRepository = userRepository;
//         this.passwordEncoder = passwordEncoder;
//         this.jwtUtil = jwtUtil;
//     }

//     public Map<String, Object> register(String username, String rawPassword, Role role) {
//         if (userRepository.existsByUsername(username)) {
//             throw new IllegalArgumentException("Username already taken");
//         }
//         String hashed = passwordEncoder.encode(rawPassword);
//         User u = new User(username, hashed, role);
//         userRepository.save(u);
//         String token = jwtUtil.generateToken(username, role.name());
//             System.out.println("[AuthService] registered user=" + username + " role=" + role.name());
//             System.out.println("[AuthService] generated token length=" + (token != null ? token.length() : 0));
//         return Map.of("token", token, "username", username, "role", role.name());
//     }

//     public Map<String, Object> login(String username, String rawPassword) {
//         System.out.println("[AuthService] login attempt for username=" + username);
//         User user = userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
//         boolean matches = passwordEncoder.matches(rawPassword, user.getPassword());
//         System.out.println("[AuthService] password matches=" + matches + " (storedHashLength=" + (user.getPassword() != null ? user.getPassword().length() : 0) + ")");
//         if (!matches) {
//             throw new IllegalArgumentException("Invalid credentials");
//         }
//         String token = jwtUtil.generateToken(username, user.getRole().name());
//         return Map.of("token", token, "username", username, "role", user.getRole().name());
//     }
// }

package com.csse.smartwaste.service;

import com.csse.smartwaste.model.Role;
import com.csse.smartwaste.model.User;
import com.csse.smartwaste.repository.UserRepository;
import com.csse.smartwaste.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, Object> login(String username, String password) {
        System.out.println("[AuthService] Login attempt for: " + username);
        
        try {
            // Find user by username
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                System.out.println("[AuthService] User not found: " + username);
                throw new IllegalArgumentException("Invalid username or password");
            }
            
            User user = userOpt.get();
            System.out.println("[AuthService] User found: " + user.getUsername() + ", role: " + user.getRole());
            
            // Verify password
            if (!passwordEncoder.matches(password, user.getPassword())) {
                System.out.println("[AuthService] Password mismatch for user: " + username);
                throw new IllegalArgumentException("Invalid username or password");
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            System.out.println("[AuthService] Token generated successfully for: " + username);
            
            return Map.of(
                "token", token,
                "role", user.getRole().name(),
                "username", user.getUsername(),
                "message", "Login successful"
            );
            
        } catch (IllegalArgumentException e) {
            System.out.println("[AuthService] Login failed: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("[AuthService] Unexpected error during login: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Login failed due to server error: " + e.getMessage());
        }
    }

    public Map<String, Object> register(String username, String password, Role role) {
        System.out.println("[AuthService] Register attempt for: " + username + " with role: " + role);
        
        try {
            // Check if user already exists
            if (userRepository.existsByUsername(username)) {
                System.out.println("[AuthService] Username already exists: " + username);
                throw new IllegalArgumentException("Username already exists");
            }
            
            // Create and save user
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            
            User savedUser = userRepository.save(user);
            System.out.println("[AuthService] User registered with ID: " + savedUser.getId());
            
            // Generate JWT token
            String token = jwtUtil.generateToken(username, role.name());
            
            return Map.of(
                "token", token,
                "role", role.name(),
                "username", username,
                "message", "Registration successful",
                "userId", savedUser.getId()
            );
            
        } catch (IllegalArgumentException e) {
            System.out.println("[AuthService] Registration failed: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("[AuthService] Unexpected error during registration: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Registration failed due to server error: " + e.getMessage());
        }
    }
}