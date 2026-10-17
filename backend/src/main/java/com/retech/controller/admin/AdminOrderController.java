package com.retech.controller.admin;

import com.retech.dto.OrderDtos.UpdateStatusRequest;
import com.retech.model.Order;
import com.retech.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {
    private final OrderService orderService;

    @GetMapping
    public List<Order> list() {
        return orderService.all();
    }

    @GetMapping("/{orderCode}")
    public Order get(@PathVariable long orderCode) {
        return orderService.getByCode(orderCode);
    }

    @PutMapping("/{orderCode}/status")
    public Order updateStatus(@PathVariable long orderCode, @Valid @RequestBody UpdateStatusRequest req) {
        return orderService.adminUpdateStatus(orderCode, req);
    }

    @PostMapping("/{orderCode}/sync-payment")
    public Order sync(@PathVariable long orderCode) {
        return orderService.syncPayment(orderCode);
    }
}
