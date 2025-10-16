// package com.csse.smartwaste.controller;

// import com.csse.smartwaste.model.Role;
// import com.csse.smartwaste.service.AuthService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.bind.annotation.CrossOrigin;

// import java.util.Map;

// @RestController
// @RequestMapping("/api/auth")
// @CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
// public class AuthController {
//     private final AuthService authService;

//     public AuthController(AuthService authService) {
//         this.authService = authService;
//     }

//     @PostMapping("/register")
//     public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
//         System.out.println("[AuthController] register called for username=" + body.get("username"));
//         String username = body.get("username");
//         String password = body.get("password");
//         String roleStr = body.get("role");
//         Role role = Role.ROLE_RESIDENTIAL;
//         if (roleStr != null) {
//             switch (roleStr.toLowerCase()) {
//                 case "admin":
//                 case "manager":
//                     role = Role.ROLE_ADMIN; break;
//                 case "collector":
//                     role = Role.ROLE_COLLECTOR; break;
//                 default:
//                     role = Role.ROLE_RESIDENTIAL; break;
//             }
//         }
//         try {
//             Map<String,Object> res = authService.register(username, password, role);
//             System.out.println("[AuthController] register successful, returning 200 for username=" + username);
//             return ResponseEntity.ok(res);
//         } catch (IllegalArgumentException e) {
//             System.out.println("[AuthController] register failed: " + e.getMessage());
//             return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//         }
//     }

//     @PostMapping("/login")
//     public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
//         System.out.println("[AuthController] login called for username=" + body.get("username"));
//         try {
//             Map<String,Object> res = authService.login(body.get("username"), body.get("password"));
//             return ResponseEntity.ok(res);
//         } catch (IllegalArgumentException e) {
//             System.out.println("[AuthController] login failed: " + e.getMessage());
//             return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
//         }
//     }
// }
package com.csse.smartwaste.controller;

import com.csse.smartwaste.model.Role;
import com.csse.smartwaste.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
             allowCredentials = "true", 
             maxAge = 3600)
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        System.out.println("[AuthController] register called for username=" + body.get("username"));
        
        String username = body.get("username");
        String password = body.get("password");
        String roleStr = body.get("role");
        
        // Validate input
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }
        
        Role role = Role.ROLE_RESIDENTIAL;
        if (roleStr != null) {
            switch (roleStr.toLowerCase()) {
                case "admin":
                case "manager":
                    role = Role.ROLE_ADMIN; break;
                case "collector":
                    role = Role.ROLE_COLLECTOR; break;
                default:
                    role = Role.ROLE_RESIDENTIAL; break;
            }
        }
        
        try {
            Map<String,Object> res = authService.register(username.trim(), password, role);
            System.out.println("[AuthController] register successful, returning 200 for username=" + username);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            System.out.println("[AuthController] register failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("[AuthController] register unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
    String username = body.get("username");
    String password = body.get("password");
    
    System.out.println("[AuthController] Login attempt - username: " + username);
    
    // Validate input
    if (username == null || username.trim().isEmpty()) {
        System.out.println("[AuthController] Validation failed: username is empty");
        return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
    }
    if (password == null || password.trim().isEmpty()) {
        System.out.println("[AuthController] Validation failed: password is empty");
        return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
    }
    
    try {
        System.out.println("[AuthController] Calling authService.login...");
        Map<String,Object> res = authService.login(username.trim(), password);
        System.out.println("[AuthController] Login successful for username: " + username);
        System.out.println("[AuthController] Response: " + res);
        return ResponseEntity.ok(res);
    } catch (IllegalArgumentException e) {
        System.out.println("[AuthController] Login failed: " + e.getMessage());
        return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
        System.out.println("[AuthController] Unexpected error: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
    }
}

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        System.out.println("[AuthController] Test endpoint called");
        return ResponseEntity.ok(Map.of(
            "message", "Backend is working", 
            "timestamp", System.currentTimeMillis()
        ));
    }

    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
}