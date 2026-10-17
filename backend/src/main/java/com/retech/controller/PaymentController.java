package com.retech.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.retech.exception.ApiException;
import com.retech.model.Order;
import com.retech.model.PaymentMethod;
import com.retech.security.CurrentUser;
import com.retech.service.OrderService;
import com.retech.service.PayOSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final OrderService orderService;
    private final PayOSService payOSService;

    /** PayOS goi ve khi co giao dich. Luon tra 200 de PayOS khong goi lai lien tuc. */
    @PostMapping("/payos/webhook")
    public Map<String, Object> webhook(@RequestBody JsonNode payload) {
        if (!payOSService.verifyWebhook(payload)) {
            log.warn("Webhook PayOS sai chu ky: {}", payload);
            return Map.of("success", false, "message", "invalid signature");
        }
        JsonNode data = payload.path("data");
        long orderCode = data.path("orderCode").asLong();
        try {
            if ("00".equals(payload.path("code").asText()) && "00".equals(data.path("code").asText("00"))) {
                orderService.markPaid(orderCode, data.path("amount").asLong(), data.path("reference").asText(null));
            }
        } catch (ApiException e) {
            // PayOS gui don test (orderCode=123) khi luu webhook -> bo qua
            log.info("Webhook cho don khong ton tai {}: {}", orderCode, e.getMessage());
        }
        return Map.of("success", true);
    }

    /** Trang ket qua thanh toan goi de lay trang thai (tu dong hoi PayOS neu webhook chua ve) */
    @GetMapping("/payos/{orderCode}/status")
    public Map<String, Object> status(@PathVariable long orderCode,
                                      @RequestParam(defaultValue = "false") boolean cancel) {
        Order o = orderService.getByCode(orderCode);
        if (o.getPaymentMethod() == PaymentMethod.PAYOS) {
            o = orderService.syncPayment(orderCode);
            if (cancel && payOSService.isDemoMode()) o = orderService.markPaymentCancelled(orderCode);
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("orderCode", o.getOrderCode());
        m.put("total", o.getTotal());
        m.put("paymentMethod", o.getPaymentMethod());
        m.put("paymentStatus", o.getPaymentStatus());
        m.put("status", o.getStatus());
        m.put("checkoutUrl", o.getCheckoutUrl());
        return m;
    }

    @GetMapping("/config")
    public Map<String, Object> config() {
        return Map.of("payosDemoMode", payOSService.isDemoMode());
    }

    /** CHE DO DEMO (chua co key PayOS): gia lap khach da chuyen khoan */
    @PostMapping("/demo/{orderCode}/confirm")
    public Order demoConfirm(@PathVariable long orderCode) {
        if (!payOSService.isDemoMode()) throw ApiException.badRequest("Chỉ dùng được khi chưa cấu hình PayOS");
        Order o = orderService.getForUser(CurrentUser.get(), orderCode);
        return orderService.markPaid(o.getOrderCode(), o.getTotal(), "DEMO" + System.currentTimeMillis());
    }
}
