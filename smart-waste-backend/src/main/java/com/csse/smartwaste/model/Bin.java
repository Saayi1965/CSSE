package com.csse.smartwaste.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bins")
public class Bin {
    @Id
    private String id;
    private String code;          // QR Code
    private String type;          // Plastic, Food, E-waste, Paper
    private String location;      // Address text
    private double lat;
    private double lng;
    private int fillLevel;        // 0 - 100
    private String status;        // Full | Empty | Pending
}
