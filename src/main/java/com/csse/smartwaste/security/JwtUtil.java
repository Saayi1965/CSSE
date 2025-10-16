// package com.csse.smartwaste.security;

// import io.jsonwebtoken.Claims;
// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.security.Keys;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Component;

// import java.nio.charset.StandardCharsets;
// import java.security.Key;
// import java.util.Date;

// @Component
// public class JwtUtil {
//     @Value("${app.jwt.secret:secret-key-change-me}")
//     private String jwtSecret;

//     @Value("${app.jwt.expiration-ms:86400000}")
//     private long jwtExpirationMs;

//     private Key signingKey() {
//         return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
//     }

//     public String generateToken(String username, String role) {
//         return Jwts.builder()
//                 .setSubject(username)
//                 .claim("role", role)
//                 .setIssuedAt(new Date())
//                 .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
//                 .signWith(signingKey())
//                 .compact();
//     }

//     public Claims parseClaims(String token) {
//         return Jwts.parserBuilder().setSigningKey(signingKey()).build().parseClaimsJws(token).getBody();
//     }

//     public boolean validateToken(String token) {
//         try {
//             parseClaims(token);
//             return true;
//         } catch (Exception e) {
//             return false;
//         }
//     }
// }
package com.csse.smartwaste.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret:mySuperSecretKeyThatIsAtLeast32BytesLong123!}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private Key getSigningKey() {
        // Ensure the secret is at least 32 characters for HS256
        String secret = jwtSecret;
        if (secret.length() < 32) {
            secret = "mySuperSecretKeyThatIsAtLeast32BytesLong123!";
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username, String role) {
        try {
            System.out.println("[JwtUtil] Generating token for username: " + username + " with role: " + role);
            
            String token = Jwts.builder()
                    .setSubject(username)
                    .claim("role", role)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                    .signWith(getSigningKey())
                    .compact();
            
            System.out.println("[JwtUtil] Token generated successfully");
            return token;
        } catch (Exception e) {
            System.err.println("[JwtUtil] Error generating token: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate token", e);
        }
    }

    public Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            System.err.println("[JwtUtil] Error parsing token: " + e.getMessage());
            throw new RuntimeException("Invalid token", e);
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            return parseClaims(token).getSubject();
        } catch (Exception e) {
            System.err.println("[JwtUtil] Error getting username from token: " + e.getMessage());
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            return parseClaims(token).get("role", String.class);
        } catch (Exception e) {
            System.err.println("[JwtUtil] Error getting role from token: " + e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            System.err.println("[JwtUtil] Token validation failed: " + e.getMessage());
            return false;
        }
    }
}