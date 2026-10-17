package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("chat_logs")
public class ChatLog {
    @Id
    private String id;
    private String sessionId;
    private String userId;
    private String question;
    private String answer;
    private List<String> productIds;
    private String source; // GEMINI | FALLBACK
    @CreatedDate
    private Instant createdAt;
}
