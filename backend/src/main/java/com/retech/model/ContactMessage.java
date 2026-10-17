package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("contacts")
public class ContactMessage {
    @Id
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private boolean handled;
    @CreatedDate
    private Instant createdAt;
}
