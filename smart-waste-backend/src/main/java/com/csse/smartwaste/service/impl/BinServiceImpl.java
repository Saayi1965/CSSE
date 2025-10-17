package com.csse.smartwaste.service.impl;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.repository.BinRepository;
import com.csse.smartwaste.service.BinService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BinServiceImpl implements BinService {

    private final BinRepository binRepository;

    public BinServiceImpl(BinRepository binRepository) {
        this.binRepository = binRepository;
    }

    @Override
    public Bin registerBin(Bin bin) {
        // ✅ Validate essential data
        if (bin.getLatitude() == 0 || bin.getLongitude() == 0) {
            throw new IllegalArgumentException("Latitude and Longitude are required.");
        }

        // ✅ Generate binId if missing
        if (bin.getBinId() == null || bin.getBinId().isEmpty()) {
            bin.setBinId("BIN-" + System.currentTimeMillis());
        }

        // ✅ Auto-fill computed fields
        bin.prepareForSave();

        return binRepository.save(bin);
    }

    @Override
    public List<Bin> getAllBins() {
        return binRepository.findAll();
    }

    @Override
    public Bin getBinById(String id) {
        return binRepository.findById(id).orElse(binRepository.findByBinId(id).orElse(null));
    }

    @Override
    public Bin updateBin(String id, Bin updatedBin) {
        Bin existing = binRepository.findById(id)
                .orElse(binRepository.findByBinId(id).orElse(null));

        if (existing == null) return null;

        // ✅ Preserve MongoDB _id & unique binId
        updatedBin.setId(existing.getId());
        updatedBin.setBinId(existing.getBinId());

        // ✅ Refresh auto fields (QR, location, etc.)
        updatedBin.prepareForSave();

        // ✅ Keep original registration date
        if (updatedBin.getRegistrationDate() == null) {
            updatedBin.setRegistrationDate(existing.getRegistrationDate());
        }

        // ✅ Update next collection if not set
        if (updatedBin.getNextCollection() == null) {
            updatedBin.setNextCollection(LocalDateTime.now().plusWeeks(1));
        }

        return binRepository.save(updatedBin);
    }

    @Override
    public void deleteBin(String id) {
        Bin existing = binRepository.findById(id)
                .orElse(binRepository.findByBinId(id).orElse(null));

        if (existing != null) {
            binRepository.delete(existing);
        }
    }
}
