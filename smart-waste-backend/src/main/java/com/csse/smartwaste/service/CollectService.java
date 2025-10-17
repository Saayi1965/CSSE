package com.csse.smartwaste.service;

import com.csse.smartwaste.model.Collection;
import java.util.List;
import java.util.Map;

public interface CollectService {
    Collection recordCollection(Map<String, Object> body);
    List<Collection> getCollectorHistory(String collectorId);
    Map<String, Object> emptyBin(String binId);
}
