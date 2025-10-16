// src/main/java/com/csse/smartwaste/repository/CollectionRepository.java
package com.csse.smartwaste.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.csse.smartwaste.model.Collection;

public interface CollectionRepository extends MongoRepository<Collection, String> {
    List<Collection> findByDateBetween(LocalDate from, LocalDate to);
}