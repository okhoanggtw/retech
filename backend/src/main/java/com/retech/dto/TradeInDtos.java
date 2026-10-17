package com.retech.dto;

import com.retech.model.TradeIn;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public final class TradeInDtos {
    private TradeInDtos() {}

    public record CreateTradeInRequest(
            @Valid @NotNull AiDtos.DeviceInfo device,
            List<String> images,
            @NotBlank(message = "Nhập họ tên") String contactName,
            @NotBlank(message = "Nhập số điện thoại") String contactPhone,
            String contactEmail) {}

    public record UpdateTradeInRequest(TradeIn.Status status, Long offerPrice, String adminNote) {}
}
