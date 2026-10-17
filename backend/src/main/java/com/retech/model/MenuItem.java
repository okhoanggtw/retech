package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("menus")
public class MenuItem {
    @Id
    private String id;
    private String label;
    private String href;
    private String position;   // HEADER | FOOTER
    private String groupName;  // nhom cot o footer
    private int sortOrder;
    @Builder.Default
    private boolean active = true;
}
