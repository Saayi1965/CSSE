// src/main/java/com/csse/smartwaste/security/JwtUtil.java
package com.csse.smartwaste.security;

import java.security.Key;
import java.util.Date;
import java.util.Map;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {
    private final Key key;
    private final long expirationMs;

    public JwtUtil(String secret, long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    public String generateToken(String subject, Map<String, Object> claims) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subject)
                .addClaims(claims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Added: used by JwtFilter */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);   // will throw if invalid/expired
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** Added: used by JwtFilter */
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getSubject(String token) {
        return parseClaims(token).getSubject();
    }
}