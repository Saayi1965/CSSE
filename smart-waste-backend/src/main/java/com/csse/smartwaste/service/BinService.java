package com.csse.smartwaste.service;

import com.csse.smartwaste.model.Bin;
import java.util.List;

public interface BinService {
    Bin registerBin(Bin bin);
    List<Bin> getAllBins();
}
