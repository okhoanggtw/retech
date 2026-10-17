package com.retech.dto;

import com.retech.model.Product;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public final class CartDtos {
    private CartDtos() {}

    public record AddItemRequest(@NotBlank String productId, @Min(1) int quantity) {}

    public record UpdateItemRequest(@Min(0) int quantity) {}

    public record CartLine(Product product, int quantity, long lineTotal, boolean available) {}

    public record CartView(List<CartLine> items, int totalQuantity, long subtotal) {}
}
