package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

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

    public boolean isValidAt(Instant now) {
        return active
                && (startAt == null || !now.isBefore(startAt))
                && (endAt == null || !now.isAfter(endAt))
                && (usageLimit <= 0 || usedCount < usageLimit);
    }

    public long calcDiscount(long subtotal) {
        if (subtotal < minOrderValue) return 0;
        long d = type == Type.PERCENT ? subtotal * value / 100 : value;
        if (type == Type.PERCENT && maxDiscount > 0) d = Math.min(d, maxDiscount);
        return Math.min(d, subtotal);
    }
}
