package com.retech.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("orders")
public class Order {
    @Id
    private String id;
    /** Ma don dang so - dung lam orderCode cho PayOS */
    @Indexed(unique = true)
    private long orderCode;
    @Indexed
    private String userId;
    @Builder.Default
    private List<Item> items = new ArrayList<>();
    private long subtotal;
    private long discount;
    private long shippingFee;
    private long total;
    private String promotionCode;
    private Shipping shipping;
    private PaymentMethod paymentMethod;
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;
    private String paymentLinkId;
    private String checkoutUrl;
    private String qrCode;
    private String paymentReference;
    private Instant paidAt;
    @Builder.Default
    private List<StatusLog> history = new ArrayList<>();
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private String productId;
        private String name;
        private String slug;
        private String image;
        private String category;
        private String brand;
        private String condition;
        private long price;
        private int quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Shipping {
        private String fullName;
        private String phone;
        private String email;
        private String address;
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusLog {
        private String status;
        private String note;
        private Instant at;
    }
}
