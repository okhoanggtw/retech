package com.retech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("users")
public class User {
    @Id
    private String id;
    private String fullName;
    @Indexed(unique = true)
    private String email;
    @JsonIgnore
    private String passwordHash;
    private String phone;
    private String address;
    private String avatar;
    @Builder.Default
    private Role role = Role.USER;
    @Builder.Default
    private boolean enabled = true;
    @CreatedDate
    private Instant createdAt;
}
