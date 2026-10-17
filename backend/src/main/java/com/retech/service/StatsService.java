package com.retech.service;

import com.retech.model.*;
import com.retech.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

/** Thong ke cho trang Admin */
@Service
@RequiredArgsConstructor
public class StatsService {
    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final TradeInRepository tradeInRepo;
    private final ChatLogRepository chatLogRepo;
    private final CategoryRepository categoryRepo;

    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");

    public record DayPoint(String date, long revenue, long orders) {}
    public record NamedValue(String name, long value) {}
    public record TopProduct(String productId, String name, String image, long quantity, long revenue) {}
    public record Overview(long revenue, long revenueThisMonth, long revenueLastMonth, long totalOrders, long pendingOrders,
                           long totalProducts, long lowStockProducts, long totalUsers, long newUsersThisMonth,
                           long tradeInRequests, long newTradeIns, long chatbotQuestions,
                           List<DayPoint> revenueByDay, List<NamedValue> ordersByStatus,
                           List<NamedValue> revenueByCategory, List<NamedValue> revenueByBrand,
                           List<NamedValue> paymentMethods, List<TopProduct> topProducts, List<Order> recentOrders) {}

    private boolean counted(Order o) {
        return o.getStatus() != OrderStatus.CANCELLED
                && (o.getPaymentStatus() == PaymentStatus.PAID || o.getStatus() == OrderStatus.COMPLETED
                || o.getStatus() == OrderStatus.SHIPPING || o.getStatus() == OrderStatus.CONFIRMED);
    }

    public Overview overview(int days) {
        List<Order> orders = orderRepo.findAll();
        List<Order> valid = orders.stream().filter(this::counted).toList();
        LocalDate today = LocalDate.now(VN);
        YearMonth thisMonth = YearMonth.from(today), lastMonth = thisMonth.minusMonths(1);

        long revenue = valid.stream().mapToLong(Order::getTotal).sum();
        long revThis = valid.stream().filter(o -> YearMonth.from(date(o)).equals(thisMonth)).mapToLong(Order::getTotal).sum();
        long revLast = valid.stream().filter(o -> YearMonth.from(date(o)).equals(lastMonth)).mapToLong(Order::getTotal).sum();

        Map<LocalDate, long[]> byDay = new TreeMap<>();
        for (int i = days - 1; i >= 0; i--) byDay.put(today.minusDays(i), new long[2]);
        for (Order o : valid) {
            long[] v = byDay.get(date(o));
            if (v != null) { v[0] += o.getTotal(); v[1]++; }
        }
        List<DayPoint> series = byDay.entrySet().stream()
                .map(e -> new DayPoint(e.getKey().toString(), e.getValue()[0], e.getValue()[1])).toList();

        Map<String, Long> status = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) status.put(s.name(), 0L);
        orders.forEach(o -> status.merge(o.getStatus().name(), 1L, Long::sum));

        Map<String, String> catNames = categoryRepo.findAll().stream()
                .collect(Collectors.toMap(Category::getSlug, Category::getName, (a, b) -> a));
        Map<String, Long> byCat = new TreeMap<>(), byBrand = new TreeMap<>();
        Map<String, TopProduct> top = new HashMap<>();
        for (Order o : valid) for (Order.Item it : o.getItems()) {
            long line = it.getPrice() * it.getQuantity();
            byCat.merge(catNames.getOrDefault(it.getCategory(), Objects.toString(it.getCategory(), "Khác")), line, Long::sum);
            byBrand.merge(Objects.toString(it.getBrand(), "Khác"), line, Long::sum);
            top.merge(it.getProductId(), new TopProduct(it.getProductId(), it.getName(), it.getImage(), it.getQuantity(), line),
                    (a, b) -> new TopProduct(a.productId(), a.name(), a.image(), a.quantity() + b.quantity(), a.revenue() + b.revenue()));
        }
        Map<String, Long> pay = new LinkedHashMap<>();
        valid.forEach(o -> pay.merge(o.getPaymentMethod().name(), 1L, Long::sum));

        List<Product> products = productRepo.findAll();
        List<User> users = userRepo.findAll();
        List<TradeIn> tradeIns = tradeInRepo.findAll();

        return new Overview(
                revenue, revThis, revLast, orders.size(),
                orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count(),
                products.size(), products.stream().filter(p -> p.isActive() && p.getStock() <= 1).count(),
                users.size(),
                users.stream().filter(u -> u.getCreatedAt() != null && YearMonth.from(u.getCreatedAt().atZone(VN)).equals(thisMonth)).count(),
                tradeIns.size(), tradeIns.stream().filter(t -> t.getStatus() == TradeIn.Status.NEW).count(),
                chatLogRepo.count(),
                series, toList(status), toList(byCat), toList(byBrand), toList(pay),
                top.values().stream().sorted(Comparator.comparingLong(TopProduct::revenue).reversed()).limit(5).toList(),
                orders.stream().sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))).limit(6).toList());
    }

    private LocalDate date(Order o) {
        Instant t = o.getCreatedAt() != null ? o.getCreatedAt() : Instant.now();
        return t.atZone(VN).toLocalDate();
    }

    private List<NamedValue> toList(Map<String, Long> m) {
        return m.entrySet().stream().map(e -> new NamedValue(e.getKey(), e.getValue())).toList();
    }
}
