package com.csse.smartwaste.repository;

import com.csse.smartwaste.model.Bin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BinRepository extends MongoRepository<Bin, String> {
    boolean existsByBinId(String binId);
}
