package com.csse.smartwaste.repository;

import com.csse.smartwaste.model.Bin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BinRepository extends MongoRepository<Bin, String> {

    // 🔹 Core identity-based lookups
    Optional<Bin> findByBinId(String binId);
    void deleteByBinId(String binId);

    // 🔹 Owner-based lookups
    List<Bin> findByOwnerId(String ownerId);
    List<Bin> findByOwnerNameIgnoreCase(String ownerName);
    List<Bin> findByEmailIgnoreCase(String email);

    // 🔹 QR-based lookup (for scanner or monitoring modules)
    Optional<Bin> findByQrData(String qrData);

    // 🔹 Filter by active/inactive status
    List<Bin> findByStatus(String status);

    // 🔹 Custom query – find by type and collection frequency
    @Query("{ 'binType': ?0, 'collectionFrequency': ?1 }")
    List<Bin> findByTypeAndFrequency(String binType, String collectionFrequency);

    // 🔹 Geo range query – find nearby bins (for map integration)
    @Query("{ 'latitude': { $gte: ?0, $lte: ?1 }, 'longitude': { $gte: ?2, $lte: ?3 } }")
    List<Bin> findBinsInRange(double latMin, double latMax, double lngMin, double lngMax);

    // 🔹 Smart monitoring search (for future dashboard filters)
    @Query("{ 'level': { $gte: ?0, $lte: ?1 }, 'monitorStatus': ?2 }")
    List<Bin> findByLevelRangeAndStatus(int minLevel, int maxLevel, String monitorStatus);
}
