package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Danh muc: dien-thoai, laptop, may-anh, tai-nghe, dong-ho */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("categories")
public class Category {
    @Id
    private String id;
    private String name;
    @Indexed(unique = true)
    private String slug;
    private String icon;
    private String description;
    /** He so khau hao/nam dung cho dinh gia (vd dien thoai 0.78 = mat 22%/nam) */
    private double yearlyRetention;
    private int sortOrder;
}
