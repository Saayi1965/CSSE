package com.csse.smartwaste.repository;

import com.csse.smartwaste.model.Collection;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface CollectionRepository extends MongoRepository<Collection, String> {
    List<Collection> findByCollectorIdOrderByCollectedAtDesc(String collectorId);
    List<Collection> findByCollectedAtBetween(LocalDateTime from, LocalDateTime to);
    // used by ReportService which queries by LocalDate range
    List<Collection> findByDateBetween(LocalDate from, LocalDate to);
    List<Collection> findByBinCode(String binCode);
}
