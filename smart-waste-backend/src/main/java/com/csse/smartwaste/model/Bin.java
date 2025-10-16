package com.csse.smartwaste.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bin {

    @Id
    private String id;

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
    private String registrationDate;
    private String nextCollection;
}
