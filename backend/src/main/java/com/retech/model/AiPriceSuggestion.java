package com.retech.model;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPriceSuggestion {
    private long suggestedPrice;   // gia ban lai goi y
    private long minPrice;
    private long maxPrice;
    private long buyPriceLow;      // gia shop nen thu mua (thap)
    private long buyPriceHigh;     // gia shop nen thu mua (cao)
    private double confidence;     // 0..1
    private String explanation;
    private List<Factor> factors;
    private String source;         // GEMINI | FORMULA
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Factor {
        private String name;
        private String impact;     // vd "-12%"
        private String note;
    }
}
