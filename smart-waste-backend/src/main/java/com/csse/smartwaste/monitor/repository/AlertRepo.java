package com.csse.smartwaste.monitor.repository;

import com.csse.smartwaste.monitor.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AlertRepo extends MongoRepository<Alert, String> {

    List<Alert> findTop10ByIsReadFalseOrderByCreatedAtDesc();

    boolean existsByBinIdAndSeverityAndIsReadFalse(String binId, String severity);
}
