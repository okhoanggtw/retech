package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.LinkedHashMap;
import java.util.Map;

/** Thong tin cua hang + lien ket mang xa hoi (1 document duy nhat id = "main") */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("settings")
public class SiteSettings {
    @Id
    private String id;
    private String storeName;
    private String slogan;
    private String hotline;
    private String email;
    private String address;
    private String workingHours;
    private String mapEmbedUrl;
    private long freeShipThreshold;
    private long shippingFee;
    @Builder.Default
    private Map<String, String> socials = new LinkedHashMap<>(); // facebook, instagram, tiktok, youtube, zalo
}
