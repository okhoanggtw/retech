package com.retech.dto;

import com.retech.model.ConditionGrade;
import com.retech.model.Product;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public final class AiDtos {
    private AiDtos() {}

    /** Thong tin thiet bi can dinh gia (dung cho ca thu mua va admin goi y gia ban) */
    public record DeviceInfo(
            @NotBlank(message = "Chọn danh mục") String category,
            @NotBlank(message = "Chọn hãng") String brand,
            @NotBlank(message = "Nhập tên model") String model,
            String storage,
            Integer purchaseYear,
            @NotNull(message = "Chọn tình trạng") ConditionGrade condition,
            Integer batteryHealth,
            List<String> issues,
            List<String> accessories,
            Long referenceNewPrice,
            String note) {}

    public record ChatMessage(@NotBlank String role, @NotBlank String content) {}

    public record ChatRequest(@NotEmpty List<ChatMessage> messages, String sessionId) {}

    public record ChatResponse(String reply, List<Product> products, List<String> suggestions, String source) {}
}
