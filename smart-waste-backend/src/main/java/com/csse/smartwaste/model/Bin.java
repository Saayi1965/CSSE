package com.csse.smartwaste.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "bins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bin {

    @Id
    private String id; // MongoDB _id

    @Indexed(unique = true)
    private String binId;

    private String ownerName;
    private String residentType;
    private String residentName;
    private String email;
    private String phone;
    private String binType;
    private String binSize;
    private String location;
    private String address;
    private String collectionFrequency;
    private double latitude;
    private double longitude;
    private String qrData;
    private String status;
    private LocalDateTime registrationDate;
    private LocalDateTime nextCollection;

    @LastModifiedDate
    private LocalDateTime lastModified;

    // ✅ Lifecycle helper (Mongo style, manual trigger from service)
    public void prepareForSave() {
        if (location == null || location.isEmpty()) {
            location = String.format("Auto-detected at %.5f, %.5f", latitude, longitude);
        }

        if (qrData == null || qrData.isEmpty()) {
            qrData = String.format("SMARTWASTE:%s:%s:%.6f:%.6f",
                    binId, binType, latitude, longitude);
        }

        if (status == null) status = "active";
        if (registrationDate == null) registrationDate = LocalDateTime.now();
        if (nextCollection == null) nextCollection = LocalDateTime.now().plusWeeks(1);
    }
}
