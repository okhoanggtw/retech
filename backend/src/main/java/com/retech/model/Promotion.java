package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Chuong trinh khuyen mai / ma giam gia (quan ly Sales) */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("promotions")
public class Promotion {
    public enum Type { PERCENT, FIXED }

    @Id
    private String id;
    @Indexed(unique = true)
    private String code;
    private String name;
    private String description;
    private Type type;
    private long value;          // % hoac so tien
    private long maxDiscount;    // tran giam (cho PERCENT), 0 = khong gioi han
    private long minOrderValue;
    private Instant startAt;
    private Instant endAt;
    private int usageLimit;      // 0 = khong gioi han
    private int usedCount;
    @Builder.Default
    private boolean active = true;

    // Chi ap dung cho san pham hoac danh muc nhat dinh (neu rong = ap dung tat ca)
    @Builder.Default
    private List<String> applicableProductIds = new ArrayList<>();
    @Builder.Default
    private List<String> applicableCategories = new ArrayList<>();

    // Yeu cau xac minh sinh vien
    private boolean studentOnly;

    public boolean isValidAt(Instant now) {
        return active
                && (startAt == null || !now.isBefore(startAt))
                && (endAt == null || !now.isAfter(endAt))
                && (usageLimit <= 0 || usedCount < usageLimit);
    }

    public boolean appliesToProduct(Product p) {
        if (p == null) return false;
        boolean hasProd = applicableProductIds != null && !applicableProductIds.isEmpty();
        boolean hasCat = applicableCategories != null && !applicableCategories.isEmpty();
        if (!hasProd && !hasCat) return true;
        if (hasProd && applicableProductIds.contains(p.getId())) return true;
        if (hasCat && applicableCategories.contains(p.getCategory())) return true;
        return false;
    }

    public long calcDiscount(long subtotal) {
        if (subtotal < minOrderValue) return 0;
        long d = type == Type.PERCENT ? subtotal * value / 100 : value;
        if (type == Type.PERCENT && maxDiscount > 0) d = Math.min(d, maxDiscount);
        return Math.min(d, subtotal);
    }

    public long calcDiscountForItems(List<com.retech.dto.CartDtos.CartLine> items) {
        if (items == null || items.isEmpty()) return 0;
        long eligibleSubtotal = items.stream()
                .filter(l -> l.available() && appliesToProduct(l.product()))
                .mapToLong(com.retech.dto.CartDtos.CartLine::lineTotal)
                .sum();
        if (eligibleSubtotal < minOrderValue) return 0;
        long d = type == Type.PERCENT ? eligibleSubtotal * value / 100 : value;
        if (type == Type.PERCENT && maxDiscount > 0) d = Math.min(d, maxDiscount);
        return Math.min(d, eligibleSubtotal);
    }
}
