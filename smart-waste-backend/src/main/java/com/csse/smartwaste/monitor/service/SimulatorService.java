package com.csse.smartwaste.monitor.service;

import com.csse.smartwaste.monitor.model.Bin;
import com.csse.smartwaste.monitor.repository.AlertRepo;
import com.csse.smartwaste.monitor.repository.BinRepo;
import com.csse.smartwaste.monitor.repository.QueueRepo;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Random;

@Service
public class SimulatorService {

    private final BinRepo binRepo;
    private final QueueRepo queueRepo;
    private final ThresholdService thresholdService;

    // ✅ Keep only this constructor
    public SimulatorService(BinRepo binRepo,
                            AlertRepo alertRepo,
                            QueueRepo queueRepo,
                            ThresholdService thresholdService) {
        this.binRepo = binRepo;
        this.queueRepo = queueRepo;
        this.thresholdService = thresholdService;
    }

    /** Core simulation step: increase levels, update statuses, evaluate thresholds, save */
    public void tickOnce() {
        List<Bin> bins = binRepo.findAll();
        Random r = new Random();

        for (Bin b : bins) {
            int inc = 5 + r.nextInt(11);  // +5..+15
            int newLevel = Math.min(100, b.getLevel() + inc);
            b.setLevel(newLevel);

            if (newLevel >= 100) {
                b.setStatus("FULL");
            } else if (newLevel >= 50) {
                b.setStatus("HALF");
            } else {
                b.setStatus("EMPTY");
            }
            b.setLastUpdated(Instant.now());

            // Evaluate bin thresholds (may create alerts and queue items)
            thresholdService.apply(b);
        }

        binRepo.saveAll(bins);
    }

    /** Convenience API used by controller/tests: perform one tick and return updated bins */
    public List<Bin> tick() {
        tickOnce();
        return binRepo.findAll();
    }
}
