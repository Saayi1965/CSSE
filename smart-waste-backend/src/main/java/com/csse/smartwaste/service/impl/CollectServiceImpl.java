package com.csse.smartwaste.service.impl;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.model.Collection;
import com.csse.smartwaste.repository.BinRepository;
import com.csse.smartwaste.repository.CollectionRepository;
import com.csse.smartwaste.service.CollectService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class CollectServiceImpl implements CollectService {

    private final CollectionRepository collectionRepo;
    private final BinRepository binRepo;

    public CollectServiceImpl(CollectionRepository collectionRepo, BinRepository binRepo) {
        this.collectionRepo = collectionRepo;
        this.binRepo = binRepo;
    }

    @Override
    public Collection recordCollection(Map<String, Object> body) {
        String binCode = (String) body.get("binCode");
        Double weightKg = body.get("weightKg") != null ? Double.valueOf(body.get("weightKg").toString()) : null;
        String note = (String) body.getOrDefault("note", "");
        String collectorId = (String) body.getOrDefault("collectorId", "COLLECTOR_01");

        Bin bin = binRepo.findByCode(binCode)
                .orElseThrow(() -> new RuntimeException("Bin not found with code: " + binCode));

    Collection record = new Collection();
    // model uses binCode for QR-based bins
    record.setBinCode(bin.getCode());
    record.setCollectorId(collectorId);
    record.setWeightKg(weightKg != null ? weightKg : 0.0);
    record.setNote(note);
    record.setCollectedAt(LocalDateTime.now());

        // ✅ Reset bin after collection
        bin.setStatus("Empty");
        bin.setFillLevel(0);
        binRepo.save(bin);

        return collectionRepo.save(record);
    }

    @Override
    public List<Collection> getCollectorHistory(String collectorId) {
        return collectionRepo.findByCollectorIdOrderByCollectedAtDesc(collectorId);
    }

    @Override
    public Map<String, Object> emptyBin(String binId) {
        Bin bin = binRepo.findById(binId)
                .orElseThrow(() -> new RuntimeException("Bin not found"));
        bin.setFillLevel(0);
        bin.setStatus("Empty");
        binRepo.save(bin);
        return Map.of("message", "Bin Emptied Successfully", "binId", binId);
    }
}
