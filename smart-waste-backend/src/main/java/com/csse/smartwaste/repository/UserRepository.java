package com.csse.smartwaste.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.csse.smartwaste.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}