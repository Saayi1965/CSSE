package com.csse.smartwaste.repository;

import com.csse.smartwaste.model.Bin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface BinRepository extends MongoRepository<Bin, String> {
    Optional<Bin> findByCode(String code);
}
