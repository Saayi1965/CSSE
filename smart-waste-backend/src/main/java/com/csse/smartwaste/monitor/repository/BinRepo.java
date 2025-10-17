package com.csse.smartwaste.monitor.repository;

import com.csse.smartwaste.monitor.model.Bin;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BinRepo extends MongoRepository<Bin, String> {
}
