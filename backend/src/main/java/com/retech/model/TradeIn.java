package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Yeu cau thu mua may cu cua khach (khach ban cho shop) - co AI dinh gia */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("trade_ins")
public class TradeIn {
    public enum Status { NEW, CONTACTED, ACCEPTED, REJECTED, COMPLETED }

    @Id
    private String id;
    private String userId;
    private String category;
    private String brand;
    private String model;
    private String storage;
    private Integer purchaseYear;
    private ConditionGrade condition;
    private Integer batteryHealth;
    @Builder.Default
    private List<String> issues = new ArrayList<>();      // loi: man hinh, loa, camera...
    @Builder.Default
    private List<String> accessories = new ArrayList<>(); // hop, sac, hoa don...
    private Long referenceNewPrice;  // gia may moi khach nhap (tuy chon)
    private String note;
    @Builder.Default
    private List<String> images = new ArrayList<>();
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private AiPriceSuggestion aiEstimate;
    private Long offerPrice;         // gia shop chot
    @Builder.Default
    private Status status = Status.NEW;
    private String adminNote;
    @CreatedDate
    private Instant createdAt;
}
