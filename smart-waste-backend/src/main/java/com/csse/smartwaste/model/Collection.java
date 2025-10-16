package com.csse.smartwaste.model;

import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Document("collections")
@Data
public class Collection {
  @Id private String id;
  private String region;
  private String wasteType;
  private double weightKg;
  private LocalDate date;
}
