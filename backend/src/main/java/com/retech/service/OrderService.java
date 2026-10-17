package com.retech.service;

import com.retech.dto.CartDtos.CartLine;
import com.retech.dto.CartDtos.CartView;
import com.retech.dto.OrderDtos.*;
import com.retech.exception.ApiException;
import com.retech.model.*;
import com.retech.repository.OrderRepository;
import com.retech.repository.ProductRepository;
import com.retech.security.AuthUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final CartService cartService;
    private final PromotionService promotionService;
    private final SettingsService settingsService;
    private final PayOSService payOSService;

    private static final DateTimeFormatter CODE_FMT =
            DateTimeFormatter.ofPattern("yyMMddHHmmss").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    public Quote quote(String userId, String promotionCode) {
        CartView cart = cartService.view(userId);
        return quote(cart, promotionCode);
    }

    private Quote quote(CartView cart, String promotionCode) {
        long subtotal = cart.subtotal();
        boolean allFreeShip = !cart.items().isEmpty() && cart.items().stream().allMatch(l -> l.product().isFreeShipping());
        long discount = 0;
        String msg = null;
        String appliedCode = null;
        if (promotionCode != null && !promotionCode.isBlank()) {
            try {
                Promotion p = promotionService.validate(promotionCode, subtotal);
                discount = p.calcDiscount(subtotal);
                appliedCode = p.getCode();
                msg = "Đã áp dụng: " + p.getName();
            } catch (ApiException e) {
                msg = e.getMessage();
            }
        }
        long ship = subtotal == 0 || allFreeShip ? 0 : settingsService.shippingFeeFor(subtotal);
        return new Quote(subtotal, discount, ship, Math.max(0, subtotal - discount) + ship, appliedCode, msg);
    }

    public Order checkout(String userId, CheckoutRequest req) {
        CartView cart = cartService.view(userId);
        if (cart.items().isEmpty()) throw ApiException.badRequest("Giỏ hàng trống");
        for (CartLine l : cart.items()) {
            if (!l.available()) throw ApiException.badRequest("Sản phẩm \"" + l.product().getName() + "\" không đủ hàng");
        }
        Quote q = quote(cart, req.promotionCode());
        if (req.promotionCode() != null && !req.promotionCode().isBlank() && q.promotionCode() == null)
            throw ApiException.badRequest(q.promotionMessage());

        // tru kho
        for (CartLine l : cart.items()) {
            Product p = l.product();
            p.setStock(p.getStock() - l.quantity());
            p.setSoldCount(p.getSoldCount() + l.quantity());
            productRepo.save(p);
        }

        var s = req.shipping();
        Order order = Order.builder()
                .orderCode(newOrderCode())
                .userId(userId)
                .items(cart.items().stream().map(l -> Order.Item.builder()
                        .productId(l.product().getId())
                        .name(l.product().getName())
                        .slug(l.product().getSlug())
                        .image(l.product().getImages().isEmpty() ? null : l.product().getImages().get(0))
                        .category(l.product().getCategory())
                        .brand(l.product().getBrand())
                        .condition(l.product().getCondition() != null ? l.product().getCondition().label : null)
                        .price(l.product().getPrice())
                        .quantity(l.quantity())
                        .build()).toList())
                .subtotal(q.subtotal())
                .discount(q.discount())
                .shippingFee(q.shippingFee())
                .total(q.total())
                .promotionCode(q.promotionCode())
                .shipping(new Order.Shipping(s.fullName(), s.phone(), s.email(), s.address(), s.note()))
                .paymentMethod(req.paymentMethod())
                .build();
        log(order, "PENDING", "Đặt hàng thành công");
        order = orderRepo.save(order);

        if (req.paymentMethod() == PaymentMethod.PAYOS) {
            try {
                PayOSService.PaymentLink link = payOSService.createPaymentLink(order);
                order.setPaymentLinkId(link.paymentLinkId());
                order.setCheckoutUrl(link.checkoutUrl());
                order.setQrCode(link.qrCode());
                order = orderRepo.save(order);
            } catch (Exception e) {
                log.error("Tao link PayOS that bai cho don {}", order.getOrderCode(), e);
                cancelInternal(order, "Không tạo được link thanh toán: " + e.getMessage());
                throw ApiException.badRequest("Không tạo được thanh toán PayOS, vui lòng thử lại hoặc chọn COD");
            }
        }
        // chi xoa gio + tinh luot dung ma khi da tao don (va link thanh toan) thanh cong
        if (q.promotionCode() != null) promotionService.find(q.promotionCode()).ifPresent(promotionService::markUsed);
        cartService.clear(userId);
        return order;
    }

    private long newOrderCode() {
        // 12 so thoi gian + 2 so ngau nhien => 14 chu so (PayOS cho phep toi da 9007199254740991)
        for (int i = 0; i < 5; i++) {
            long code = Long.parseLong(CODE_FMT.format(Instant.now()) + String.format("%02d", ThreadLocalRandom.current().nextInt(100)));
            if (orderRepo.findByOrderCode(code).isEmpty()) return code;
        }
        throw new IllegalStateException("Khong tao duoc ma don");
    }

    public List<Order> myOrders(String userId) {
        return orderRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getForUser(AuthUser user, long orderCode) {
        Order o = orderRepo.findByOrderCode(orderCode).orElseThrow(() -> ApiException.notFound("đơn hàng"));
        if (!user.isAdmin() && !o.getUserId().equals(user.id()))
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem đơn này");
        return o;
    }

    public Order getByCode(long orderCode) {
        return orderRepo.findByOrderCode(orderCode).orElseThrow(() -> ApiException.notFound("đơn hàng"));
    }

    public Order cancelByUser(AuthUser user, long orderCode) {
        Order o = getForUser(user, orderCode);
        if (o.getStatus() != OrderStatus.PENDING || o.getPaymentStatus() == PaymentStatus.PAID)
            throw ApiException.badRequest("Đơn hàng đã được xử lý, không thể hủy. Vui lòng liên hệ cửa hàng.");
        if (o.getPaymentMethod() == PaymentMethod.PAYOS) payOSService.cancelQuietly(o.getOrderCode(), "Khach huy don");
        return cancelInternal(o, "Khách hàng hủy đơn");
    }

    private Order cancelInternal(Order o, String note) {
        if (o.getStatus() == OrderStatus.CANCELLED) return o;
        for (Order.Item it : o.getItems()) {
            productRepo.findById(it.getProductId()).ifPresent(p -> {
                p.setStock(p.getStock() + it.getQuantity());
                p.setSoldCount(Math.max(0, p.getSoldCount() - it.getQuantity()));
                productRepo.save(p);
            });
        }
        o.setStatus(OrderStatus.CANCELLED);
        if (o.getPaymentStatus() == PaymentStatus.UNPAID) o.setPaymentStatus(PaymentStatus.CANCELLED);
        log(o, "CANCELLED", note);
        return orderRepo.save(o);
    }

    /** Goi khi PayOS bao da thanh toan (webhook hoac dong bo trang thai) */
    public Order markPaid(long orderCode, long amount, String reference) {
        Order o = getByCode(orderCode);
        if (o.getPaymentStatus() == PaymentStatus.PAID) return o;
        if (amount < o.getTotal()) {
            log.warn("Don {} thanh toan thieu: {} < {}", orderCode, amount, o.getTotal());
            return o;
        }
        o.setPaymentStatus(PaymentStatus.PAID);
        o.setPaidAt(Instant.now());
        o.setPaymentReference(reference);
        if (o.getStatus() == OrderStatus.PENDING) o.setStatus(OrderStatus.CONFIRMED);
        log(o, "PAID", "Thanh toán PayOS thành công" + (reference != null ? " (mã GD " + reference + ")" : ""));
        return orderRepo.save(o);
    }

    public Order markPaymentCancelled(long orderCode) {
        Order o = getByCode(orderCode);
        if (o.getPaymentStatus() == PaymentStatus.PAID) return o;
        return cancelInternal(o, "Khách hủy thanh toán PayOS");
    }

    /** Hoi PayOS trang thai that (dung khi webhook chua ve, vd chay localhost) */
    public Order syncPayment(long orderCode) {
        Order o = getByCode(orderCode);
        if (o.getPaymentMethod() != PaymentMethod.PAYOS || o.getPaymentStatus() != PaymentStatus.UNPAID) return o;
        PayOSService.PaymentInfo info = payOSService.getPaymentInfo(orderCode);
        if (info == null) return o;
        return switch (info.status()) {
            case "PAID" -> markPaid(orderCode, info.amountPaid(), info.reference());
            case "CANCELLED", "EXPIRED" -> markPaymentCancelled(orderCode);
            default -> o;
        };
    }

    // ---------- Admin ----------
    public List<Order> all() {
        return orderRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Order adminUpdateStatus(long orderCode, UpdateStatusRequest req) {
        Order o = getByCode(orderCode);
        if (req.status() == OrderStatus.CANCELLED) return cancelInternal(o, req.note() != null ? req.note() : "Admin hủy đơn");
        if (o.getStatus() == OrderStatus.CANCELLED) throw ApiException.badRequest("Đơn đã hủy");
        o.setStatus(req.status());
        if (req.status() == OrderStatus.COMPLETED && o.getPaymentMethod() == PaymentMethod.COD) {
            o.setPaymentStatus(PaymentStatus.PAID);
            o.setPaidAt(Instant.now());
        }
        log(o, req.status().name(), req.note());
        return orderRepo.save(o);
    }

    private void log(Order o, String status, String note) {
        o.getHistory().add(new Order.StatusLog(status, note, Instant.now()));
    }
}
