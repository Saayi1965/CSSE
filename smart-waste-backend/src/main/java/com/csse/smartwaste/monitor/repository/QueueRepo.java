package com.csse.smartwaste.monitor.repository;

import com.csse.smartwaste.monitor.model.QueueItem;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QueueRepo extends MongoRepository<QueueItem, String> {

    long count();

    boolean existsByBinId(String binId);

    boolean existsByBinIdAndStatus(String binId, String status);
}
