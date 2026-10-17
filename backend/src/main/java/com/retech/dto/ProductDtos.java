package com.retech.dto;

import com.retech.model.ConditionGrade;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

public final class ProductDtos {
    private ProductDtos() {}

    public record ProductRequest(
            @NotBlank(message = "Nhập tên sản phẩm") String name,
            String slug,
            @NotBlank(message = "Chọn danh mục") String category,
            @NotBlank(message = "Chọn hãng") String brand,
            String model,
            String variant,
            @NotNull(message = "Chọn tình trạng") ConditionGrade condition,
            Integer batteryHealth,
            @Min(value = 1000, message = "Giá không hợp lệ") long price,
            long originalPrice,
            @Min(0) int stock,
            int warrantyMonths,
            List<String> images,
            Map<String, String> specs,
            List<String> highlights,
            String description,
            List<String> tags,
            int releaseYear,
            boolean featured,
            Boolean active,
            Boolean freeShipping) {}

    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {}

    public record BrandInfo(String name, String slug, long productCount) {}
}
