package com.example.cartradingsystem.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "vehicles")
@Data
public class Vehicle {

    @Id
    private String id;

    private String title;
    private String brand;
    private String model;
    private Integer year;
    private BigDecimal price;
    private Integer mileage;

    @Field("fuelType")
    private String fuelType;

    @Field("transmission")
    private String transmission;

    @Field("condition")
    private String condition;

    private String district;
    private String city;
    private String description;

    @Field("availabilityStatus")
    private String availabilityStatus;

    @Field("sellerId")
    private String sellerId;

    @Field("videoUrl")
    private String videoUrl;

    @Field("createdAt")
    private LocalDateTime createdAt;

    @Field("updatedAt")
    private LocalDateTime updatedAt;
}
