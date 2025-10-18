// src/main/java/com/csse/smartwaste/config/DataSeeder.java
package com.csse.smartwaste.config;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import com.csse.smartwaste.model.Collection;
import com.csse.smartwaste.repository.CollectionRepository;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CollectionRepository repo;

    public DataSeeder(CollectionRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        try {
            long cnt = repo.count();
            if (cnt == 0) {
                Collection c = new Collection();
                c.setRegion("Colombo");
                c.setWasteType("Plastic");
                c.setWeightKg(12.5);
                c.setDate(LocalDate.now().minusDays(1));
                repo.save(c);

                Collection d = new Collection("Gampaha", "Organic", 8.2, LocalDate.now());
                repo.save(d);
                log.info("Seeded initial collections ({} items)", 2);
            }
        } catch (Exception ex) {
            // If MongoDB isn't available at startup, don't fail the whole application.
            log.warn("Skipping data seeding: could not connect to MongoDB at startup ({}). Reason: {}. \nTip: ensure MongoDB is running at localhost:27017 or update spring.data.mongodb.uri in application.properties.", ex.getClass().getSimpleName(), ex.getMessage());
        }
    }
}