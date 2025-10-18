package com.csse.smartwaste.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.csse.smartwaste.model.Bin;

public interface BinRepository extends MongoRepository<Bin, String> {
}
