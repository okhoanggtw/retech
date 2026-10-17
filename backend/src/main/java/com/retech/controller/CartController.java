package com.retech.controller;

import com.retech.dto.CartDtos.*;
import com.retech.security.CurrentUser;
import com.retech.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public CartView view() {
        return cartService.view(CurrentUser.id());
    }

    @PostMapping("/items")
    public CartView add(@Valid @RequestBody AddItemRequest req) {
        return cartService.add(CurrentUser.id(), req);
    }

    @PutMapping("/items/{productId}")
    public CartView update(@PathVariable String productId, @Valid @RequestBody UpdateItemRequest req) {
        return cartService.update(CurrentUser.id(), productId, req.quantity());
    }

    @DeleteMapping("/items/{productId}")
    public CartView remove(@PathVariable String productId) {
        return cartService.update(CurrentUser.id(), productId, 0);
    }

    @DeleteMapping
    public CartView clear() {
        cartService.clear(CurrentUser.id());
        return cartService.view(CurrentUser.id());
    }
}
