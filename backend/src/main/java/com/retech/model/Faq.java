package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("faqs")
public class Faq {
    @Id
    private String id;
    private String question;
    private String answer;
    private String topic;
    private int sortOrder;
}
