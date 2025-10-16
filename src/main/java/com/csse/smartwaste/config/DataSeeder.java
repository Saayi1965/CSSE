package com.csse.smartwaste.config;

import com.csse.smartwaste.model.Collection;
import com.csse.smartwaste.repository.CollectionRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

  @Bean
  CommandLineRunner seed(CollectionRepository repo) {
    return args -> {
      try {
        if (repo.count() == 0) {
          var items = List.of(
              create("Colombo","General",920, LocalDate.of(2025,1,1)),
              create("Colombo","Recyclables",600, LocalDate.of(2025,1,2)),
              create("Colombo","Organic",890, LocalDate.of(2025,1,3)),
              create("Colombo","Other",810, LocalDate.of(2025,1,4))
          );
          repo.saveAll(items);
          System.out.println("[DataSeeder] seeded sample collections: " + items.size());
        }
      } catch (Exception ex) {
        System.out.println("[DataSeeder] skipped seeding - repository unavailable: " + ex.getMessage());
      }
    };
  }

  private Collection create(String region, String type, double w, LocalDate date){
    Collection c = new Collection();
    c.setRegion(region);
    c.setWasteType(type);
    c.setWeightKg(w);
    c.setDate(date);
    return c;
  }
}
