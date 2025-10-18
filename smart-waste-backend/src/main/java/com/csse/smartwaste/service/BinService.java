package com.csse.smartwaste.service;

import com.csse.smartwaste.model.Bin;
import java.util.List;
import java.util.Optional;

public interface BinService {

    // 🔹 Core CRUD operations
    Bin registerBin(Bin bin);
    List<Bin> getAllBins();
    Bin getBinById(String id);
    Bin updateBin(String id, Bin bin);
    void deleteBin(String id);

    // 🔹 Find bin by unique binId
    Optional<Bin> getBinByBinId(String binId);

    // 🔹 Find bins belonging to a specific user
    List<Bin> getBinsByOwnerId(String ownerId);
    List<Bin> getBinsByOwnerName(String ownerName);
    List<Bin> getBinsByEmail(String email);

    // 🔹 Find active/inactive bins
    List<Bin> getBinsByStatus(String status);

    // 🔹 Find bin by QR (for collector scanning)
    Optional<Bin> getBinByQrData(String qrData);

    // 🔹 Search bins by type and collection frequency
    List<Bin> getBinsByTypeAndFrequency(String binType, String collectionFrequency);

    // 🔹 Find nearby bins (geo range)
    List<Bin> getBinsInRange(double latMin, double latMax, double lngMin, double lngMax);

    // 🔹 Update fill level and monitoring info
    Bin updateBinLevel(String binId, int newLevel);

    // 🔹 Utility: check if a binId or QR already exists
    boolean existsByBinId(String binId);
    boolean existsByQrData(String qrData);
}
