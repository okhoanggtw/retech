package com.retech.controller;

import com.retech.dto.OrderDtos.*;
import com.retech.model.Order;
import com.retech.security.CurrentUser;
import com.retech.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    /** Tinh tong tien truoc khi dat (trang xac nhan dat hang) */
    @PostMapping("/quote")
    public Quote quote(@RequestBody(required = false) QuoteRequest req) {
        return orderService.quote(CurrentUser.id(), req != null ? req.promotionCode() : null);
    }

    @PostMapping
    public Order checkout(@Valid @RequestBody CheckoutRequest req) {
        return orderService.checkout(CurrentUser.id(), req);
    }

    @GetMapping
    public List<Order> mine() {
        return orderService.myOrders(CurrentUser.id());
    }

    @GetMapping("/{orderCode}")
    public Order get(@PathVariable long orderCode) {
        return orderService.getForUser(CurrentUser.get(), orderCode);
    }

    @PostMapping("/{orderCode}/cancel")
    public Order cancel(@PathVariable long orderCode) {
        return orderService.cancelByUser(CurrentUser.get(), orderCode);
    }
}
