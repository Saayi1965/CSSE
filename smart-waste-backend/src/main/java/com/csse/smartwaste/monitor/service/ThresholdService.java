package com.csse.smartwaste.monitor.service;

import com.csse.smartwaste.monitor.model.Alert;
import com.csse.smartwaste.monitor.model.Bin;
import com.csse.smartwaste.monitor.model.QueueItem;
import com.csse.smartwaste.monitor.repository.AlertRepo;
import com.csse.smartwaste.monitor.repository.QueueRepo;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ThresholdService {

    private final AlertRepo alertRepo;
    private final QueueRepo queueRepo;

    public ThresholdService(AlertRepo alertRepo, QueueRepo queueRepo) {
        this.alertRepo = alertRepo;
        this.queueRepo = queueRepo;
    }

    /**
     * Apply business thresholds:
     * - level >= 100 -> FULL -> alert + enqueue if not already pending
     * - level >= 80  -> NEAR_FULL -> alert if not already open (unread)
     */
    public void apply(Bin b) {
        int level = b.getLevel();
        String binId = b.getId();

        if (level >= 100) {
            // FULL
            if (!alertRepo.existsByBinIdAndSeverityAndIsReadFalse(binId, "FULL")) {
                Alert a = new Alert(binId, "FULL", "Bin " + binId + " is FULL");
                a.setCreatedAt(Instant.now());
                a.setIsRead(false);
                alertRepo.save(a);
            }

            if (!queueRepo.existsByBinIdAndStatus(binId, "PENDING")) {
                QueueItem qi = new QueueItem(binId);
                qi.setStatus("PENDING");
                qi.setQueuedAt(Instant.now());
                queueRepo.save(qi);
            }
        } else if (level >= 80) {
            // NEAR_FULL
            if (!alertRepo.existsByBinIdAndSeverityAndIsReadFalse(binId, "NEAR_FULL")) {
                Alert a = new Alert(binId, "NEAR_FULL", "Bin " + binId + " is near full");
                a.setCreatedAt(Instant.now());
                a.setIsRead(false);
                alertRepo.save(a);
            }
        }
    }
}
