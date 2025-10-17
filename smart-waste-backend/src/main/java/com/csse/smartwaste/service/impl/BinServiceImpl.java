package com.csse.smartwaste.service.impl;

import com.csse.smartwaste.model.Bin;
import com.csse.smartwaste.repository.BinRepository;
import com.csse.smartwaste.service.BinService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BinServiceImpl implements BinService {

    private final BinRepository binRepository;

    public BinServiceImpl(BinRepository binRepository) {
        this.binRepository = binRepository;
    }

    @Override
    public Bin registerBin(Bin bin) {
        return binRepository.save(bin);
    }

    @Override
    public List<Bin> getAllBins() {
        return binRepository.findAll();
    }

    @Override
    public Bin getBinById(String id) {
        // Try both MongoDB _id and binId
        return binRepository.findById(id).orElse(binRepository.findByBinId(id));
    }

    @Override
    public Bin updateBin(String id, Bin updatedBin) {
        // Try to find the existing bin
        Bin existing = binRepository.findById(id).orElse(binRepository.findByBinId(id));
        if (existing == null) return null;

        // ✅ Preserve Mongo _id and key data
        updatedBin.setId(existing.getId());
        if (updatedBin.getBinId() == null) updatedBin.setBinId(existing.getBinId());
        if (updatedBin.getQrData() == null) updatedBin.setQrData(existing.getQrData());
        if (updatedBin.getRegistrationDate() == null) updatedBin.setRegistrationDate(existing.getRegistrationDate());
        if (updatedBin.getNextCollection() == null) updatedBin.setNextCollection(existing.getNextCollection());

        return binRepository.save(updatedBin);
    }

    @Override
    public void deleteBin(String id) {
        Bin existing = binRepository.findById(id).orElse(binRepository.findByBinId(id));
        if (existing != null) {
            binRepository.delete(existing);
        }
    }
}
