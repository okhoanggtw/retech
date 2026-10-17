package com.retech.service;

import com.retech.dto.CartDtos.*;
import com.retech.exception.ApiException;
import com.retech.model.Cart;
import com.retech.model.Product;
import com.retech.repository.CartRepository;
import com.retech.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepo;
    private final ProductRepository productRepo;

    private Cart load(String userId) {
        return cartRepo.findByUserId(userId).orElseGet(() -> {
            Cart c = new Cart();
            c.setUserId(userId);
            return c;
        });
    }

    public CartView view(String userId) {
        Cart cart = load(userId);
        Map<String, Product> products = productRepo.findAllById(
                cart.getItems().stream().map(Cart.Item::getProductId).toList())
                .stream().collect(Collectors.toMap(Product::getId, Function.identity()));
        List<CartLine> lines = new ArrayList<>();
        long subtotal = 0;
        int qty = 0;
        for (Cart.Item it : cart.getItems()) {
            Product p = products.get(it.getProductId());
            if (p == null) continue;
            boolean available = p.isActive() && p.getStock() >= it.getQuantity();
            long line = p.getPrice() * it.getQuantity();
            lines.add(new CartLine(p, it.getQuantity(), line, available));
            if (available) {
                subtotal += line;
                qty += it.getQuantity();
            }
        }
        return new CartView(lines, qty, subtotal);
    }

    public CartView add(String userId, AddItemRequest req) {
        Product p = productRepo.findById(req.productId()).orElseThrow(() -> ApiException.notFound("sản phẩm"));
        if (!p.isActive() || p.getStock() <= 0) throw ApiException.badRequest("Sản phẩm đã hết hàng");
        Cart cart = load(userId);
        Cart.Item item = cart.getItems().stream().filter(i -> i.getProductId().equals(p.getId())).findFirst().orElse(null);
        int newQty = (item == null ? 0 : item.getQuantity()) + req.quantity();
        if (newQty > p.getStock()) throw ApiException.badRequest("Chỉ còn " + p.getStock() + " sản phẩm trong kho");
        if (item == null) cart.getItems().add(new Cart.Item(p.getId(), req.quantity()));
        else item.setQuantity(newQty);
        cartRepo.save(cart);
        return view(userId);
    }

    public CartView update(String userId, String productId, int quantity) {
        Cart cart = load(userId);
        if (quantity <= 0) {
            cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        } else {
            Product p = productRepo.findById(productId).orElseThrow(() -> ApiException.notFound("sản phẩm"));
            if (quantity > p.getStock()) throw ApiException.badRequest("Chỉ còn " + p.getStock() + " sản phẩm trong kho");
            cart.getItems().stream().filter(i -> i.getProductId().equals(productId)).findFirst()
                    .ifPresentOrElse(i -> i.setQuantity(quantity), () -> cart.getItems().add(new Cart.Item(productId, quantity)));
        }
        cartRepo.save(cart);
        return view(userId);
    }

    public void clear(String userId) {
        cartRepo.findByUserId(userId).ifPresent(c -> {
            c.getItems().clear();
            cartRepo.save(c);
        });
    }
}
