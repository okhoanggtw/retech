package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("products")
public class Product {
    @Id
    private String id;
    private String name;
    @Indexed(unique = true)
    private String slug;
    @Indexed
    private String category;      // slug danh muc
    @Indexed
    private String brand;         // Apple, Samsung, Xiaomi, Sony, Canon
    private String model;         // vd "iPhone 15 Pro Max"
    private String variant;       // vd "256GB - Titan Tu Nhien"
    private ConditionGrade condition;
    private Integer batteryHealth; // % pin (dien thoai, laptop, dong ho)
    private long price;           // gia ban hien tai (VND)
    private long originalPrice;   // gia may moi tham khao
    private int stock;
    private int warrantyMonths;
    @Builder.Default
    private List<String> images = new ArrayList<>();
    @Builder.Default
    private Map<String, String> specs = new LinkedHashMap<>();
    @Builder.Default
    private List<String> highlights = new ArrayList<>();
    private String description;
    @Builder.Default
    private List<String> tags = new ArrayList<>();
    /** San pham di kem do admin chon (id), hien o muc "Thuong mua kem" */
    @Builder.Default
    private List<String> addOnIds = new ArrayList<>();
    private int releaseYear;
    private boolean featured;
    /** Mien phi giao hang (vd san pham test 2.000d) */
    private boolean freeShipping;
    @Builder.Default
    private boolean active = true;
    private int soldCount;
    private int viewCount;
    /** Chuoi tim kiem khong dau, chu thuong (tu dong tao khi luu) */
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String searchText;
    /** Ket qua AI goi y gia gan nhat (admin) */
    private AiPriceSuggestion aiSuggestion;
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public int discountPercent() {
        if (originalPrice <= 0 || price >= originalPrice) return 0;
        return (int) Math.round(100.0 * (originalPrice - price) / originalPrice);
    }
}
