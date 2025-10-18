package com.csse.smartwaste.service.impl;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.repository.BinRepository;
import com.csse.smartwaste.service.BinService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BinServiceImpl implements BinService {

    private final BinRepository binRepository;

    public BinServiceImpl(BinRepository binRepository) {
        this.binRepository = binRepository;
    }

    // ✅ Register new bin (resident registration flow)
    @Override
    public Bin registerBin(Bin bin) {
        if (bin.getLatitude() == null || bin.getLongitude() == null) {
            throw new IllegalArgumentException("Latitude and Longitude are required.");
        }

        // Generate unique Bin ID if missing
        if (bin.getBinId() == null || bin.getBinId().isEmpty()) {
            bin.setBinId("BIN-" + System.currentTimeMillis());
        }

        // Ensure unique QR data and prepare system fields
        bin.prepareForSave();

        // Default monitoring values
        if (bin.getLevel() == 0) {
            bin.setLevel(0);
            bin.setMonitorStatus("EMPTY");
        }
        if (bin.getLastUpdated() == null) {
            bin.setLastUpdated(java.time.Instant.now());
        }

        return binRepository.save(bin);
    }

    // ✅ Get all bins
    @Override
    public List<Bin> getAllBins() {
        return binRepository.findAll();
    }

    // ✅ Get bin by Mongo _id or unique binId
    @Override
    public Bin getBinById(String id) {
        return binRepository.findById(id)
                .or(() -> binRepository.findByBinId(id))
                .orElse(null);
    }

    // ✅ Get bin by binId wrapper
    @Override
    public Optional<Bin> getBinByBinId(String binId) {
        return binRepository.findByBinId(binId);
    }

    // ✅ Get bins belonging to a specific user
    @Override
    public List<Bin> getBinsByOwnerId(String ownerId) {
        return binRepository.findByOwnerId(ownerId);
    }

    @Override
    public List<Bin> getBinsByOwnerName(String ownerName) {
        return binRepository.findByOwnerNameIgnoreCase(ownerName);
    }

    @Override
    public List<Bin> getBinsByEmail(String email) {
        return binRepository.findByEmailIgnoreCase(email);
    }

    // ✅ Get bins by status (active/inactive)
    @Override
    public List<Bin> getBinsByStatus(String status) {
        return binRepository.findByStatus(status);
    }

    // ✅ Get bin by QR data (collector scan)
    @Override
    public Optional<Bin> getBinByQrData(String qrData) {
        return binRepository.findByQrData(qrData);
    }

    // ✅ Get bins by type and frequency
    @Override
    public List<Bin> getBinsByTypeAndFrequency(String binType, String collectionFrequency) {
        return binRepository.findByTypeAndFrequency(binType, collectionFrequency);
    }

    // ✅ Geo range search (map integration)
    @Override
    public List<Bin> getBinsInRange(double latMin, double latMax, double lngMin, double lngMax) {
        return binRepository.findBinsInRange(latMin, latMax, lngMin, lngMax);
    }

    // ✅ Update existing bin
    @Override
    public Bin updateBin(String id, Bin updatedBin) {
        Bin existing = binRepository.findById(id)
                .or(() -> binRepository.findByBinId(id))
                .orElse(null);

        if (existing == null) return null;

        // Preserve MongoDB ID and binId
        updatedBin.setId(existing.getId());
        updatedBin.setBinId(existing.getBinId());

        // Refresh computed fields
        updatedBin.prepareForSave();

        // Keep original registration date
        if (updatedBin.getRegistrationDate() == null) {
            updatedBin.setRegistrationDate(existing.getRegistrationDate());
        }

        // Auto-set next collection if missing
        if (updatedBin.getNextCollection() == null) {
            updatedBin.setNextCollection(LocalDateTime.now().plusWeeks(1));
        }

        return binRepository.save(updatedBin);
    }

    // ✅ Delete bin
    @Override
    public void deleteBin(String id) {
        Bin existing = binRepository.findById(id)
                .or(() -> binRepository.findByBinId(id))
                .orElse(null);

        if (existing != null) {
            binRepository.delete(existing);
        }
    }

    // ✅ Update bin level (used for monitoring or collector updates)
    @Override
    public Bin updateBinLevel(String binId, int newLevel) {
        Bin bin = binRepository.findByBinId(binId)
                .orElseThrow(() -> new IllegalArgumentException("Bin not found with ID: " + binId));

        bin.updateLevel(newLevel); // uses the helper inside model
        return binRepository.save(bin);
    }

    // ✅ Existence checks
    @Override
    public boolean existsByBinId(String binId) {
        return binRepository.findByBinId(binId).isPresent();
    }

    @Override
    public boolean existsByQrData(String qrData) {
        return binRepository.findByQrData(qrData).isPresent();
    }
}
