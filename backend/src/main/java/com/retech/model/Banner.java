package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("banners")
public class Banner {
    @Id
    private String id;
    private String title;
    private String subtitle;
    private String image;
    private String ctaText;
    private String link;
    private String theme;      // dark | light
    private int sortOrder;
    @Builder.Default
    private boolean active = true;
}
