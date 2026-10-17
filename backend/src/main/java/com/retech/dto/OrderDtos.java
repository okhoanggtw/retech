package com.retech.dto;

import com.retech.model.OrderStatus;
import com.retech.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public final class OrderDtos {
    private OrderDtos() {}

    public record ShippingRequest(
            @NotBlank(message = "Nhập họ tên người nhận") String fullName,
            @NotBlank(message = "Nhập số điện thoại")
            @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ") String phone,
            String email,
            @NotBlank(message = "Nhập địa chỉ giao hàng") String address,
            String note) {}

    public record CheckoutRequest(
            @Valid @NotNull ShippingRequest shipping,
            @NotNull(message = "Chọn phương thức thanh toán") PaymentMethod paymentMethod,
            String promotionCode) {}

    /** Tinh truoc tong tien (trang xac nhan dat hang) */
    public record QuoteRequest(String promotionCode) {}

    public record Quote(long subtotal, long discount, long shippingFee, long total,
                        String promotionCode, String promotionMessage) {}

    public record UpdateStatusRequest(@NotNull OrderStatus status, String note) {}
}
