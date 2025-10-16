// src/main/java/com/csse/smartwaste/service/AuthService.java
package com.csse.smartwaste.service;

import java.util.Map;

import com.csse.smartwaste.model.Role;

public interface AuthService {
    Map<String, Object> register(String username, String rawPassword, Role role);
    Map<String, Object> login(String username, String rawPassword);
}