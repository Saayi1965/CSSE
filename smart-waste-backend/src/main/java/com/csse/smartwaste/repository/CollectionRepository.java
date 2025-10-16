package com.csse.smartwaste.repository;

import com.csse.smartwaste.model.Collection;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CollectionRepository extends MongoRepository<Collection,String> {
  List<Collection> findByDateBetween(LocalDate start, LocalDate end);
}
