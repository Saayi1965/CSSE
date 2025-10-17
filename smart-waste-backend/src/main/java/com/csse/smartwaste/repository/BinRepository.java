package com.csse.smartwaste.repository;

import com.csse.smartwaste.model.Bin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BinRepository extends MongoRepository<Bin, String> {

    // ✅ Find a bin by unique binId
    Optional<Bin> findByBinId(String binId);

    // ✅ Delete a bin by unique binId
    void deleteByBinId(String binId);

    // ✅ Find all bins belonging to an owner
    List<Bin> findByOwnerNameIgnoreCase(String ownerName);

    // ✅ Find bins by email (useful for user dashboards)
    List<Bin> findByEmailIgnoreCase(String email);

    // ✅ Find active bins
    List<Bin> findByStatus(String status);

    // ✅ Custom search by multiple parameters
    @Query("{ 'binType': ?0, 'collectionFrequency': ?1 }")
    List<Bin> findByTypeAndFrequency(String binType, String collectionFrequency);

    // ✅ Nearby search (example for future geo features)
    @Query("{ 'latitude': { $gte: ?0, $lte: ?1 }, 'longitude': { $gte: ?2, $lte: ?3 } }")
    List<Bin> findBinsInRange(double latMin, double latMax, double lngMin, double lngMax);
}
