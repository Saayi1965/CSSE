package com.csse.smartwaste.service;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.repository.BinRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BinServiceImpl implements BinService {

    private final BinRepository binRepository;

    public BinServiceImpl(BinRepository binRepository) {
        this.binRepository = binRepository;
    }

    @Override
    public Bin registerBin(Bin bin) {
        // Generate unique Bin ID
        bin.setBinId("BIN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        // Default values
        bin.setStatus("active");
        bin.setRegistrationDate(LocalDateTime.now().toString());
        if (bin.getNextCollection() == null)
            bin.setNextCollection(LocalDateTime.now().plusDays(7).toString());

        return binRepository.save(bin);
    }

    @Override
    public List<Bin> getAllBins() {
        return binRepository.findAll();
    }
}
