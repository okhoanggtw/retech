package com.retech.service;

import com.retech.dto.ProductDtos.*;
import com.retech.exception.ApiException;
import com.retech.model.ConditionGrade;
import com.retech.model.Order;
import com.retech.model.OrderStatus;
import com.retech.model.Product;
import com.retech.repository.ProductRepository;
import com.retech.util.TextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository repo;
    private final MongoTemplate mongo;

    public record SearchParams(String q, String category, List<String> brands, List<ConditionGrade> conditions,
                               Long minPrice, Long maxPrice, String sort, boolean includeInactive,
                               int page, int size) {}

    public PageResponse<Product> search(SearchParams p) {
        Query query = new Query();
        List<Criteria> and = new ArrayList<>();
        if (!p.includeInactive()) and.add(Criteria.where("active").is(true));
        if (p.q() != null && !p.q().isBlank()) {
            // moi tu khoa deu phai xuat hien trong searchText (khong dau)
            for (String token : TextUtil.normalize(p.q()).split(" ")) {
                if (token.isBlank()) continue;
                and.add(Criteria.where("searchText").regex(Pattern.quote(token)));
            }
        }
        if (p.category() != null && !p.category().isBlank()) and.add(Criteria.where("category").is(p.category()));
        if (p.brands() != null && !p.brands().isEmpty()) and.add(Criteria.where("brand").in(p.brands()));
        if (p.conditions() != null && !p.conditions().isEmpty()) and.add(Criteria.where("condition").in(p.conditions()));
        if (p.minPrice() != null) and.add(Criteria.where("price").gte(p.minPrice()));
        if (p.maxPrice() != null) and.add(Criteria.where("price").lte(p.maxPrice()));
        if (!and.isEmpty()) query.addCriteria(new Criteria().andOperator(and.toArray(new Criteria[0])));

        long total = mongo.count(query, Product.class);
        query.with(sortOf(p.sort()));
        int size = Math.max(1, Math.min(p.size(), 60));
        int page = Math.max(0, p.page());
        query.skip((long) page * size).limit(size);
        List<Product> content = mongo.find(query, Product.class);
        return new PageResponse<>(content, page, size, total, (int) Math.ceil((double) total / size));
    }

    private Sort sortOf(String sort) {
        if (sort == null) sort = "newest";
        return switch (sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "bestseller" -> Sort.by(Sort.Direction.DESC, "soldCount");
            case "discount" -> Sort.by(Sort.Direction.ASC, "price"); // gan dung
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    public Product getBySlugOrId(String key) {
        Product p = repo.findBySlug(key).or(() -> repo.findById(key))
                .orElseThrow(() -> ApiException.notFound("sản phẩm"));
        return p;
    }

    public Product viewBySlug(String slug) {
        Product p = getBySlugOrId(slug);
        if (!p.isActive()) throw ApiException.notFound("sản phẩm");
        p.setViewCount(p.getViewCount() + 1);
        return repo.save(p);
    }

    public List<Product> related(Product p, int limit) {
        List<Product> list = new ArrayList<>(repo.findByCategoryAndActiveTrue(p.getCategory()));
        list.removeIf(x -> x.getId().equals(p.getId()));
        // uu tien cung hang, gia gan nhat
        list.sort(Comparator.<Product>comparingInt(x -> x.getBrand().equalsIgnoreCase(p.getBrand()) ? 0 : 1)
                .thenComparingLong(x -> Math.abs(x.getPrice() - p.getPrice())));
        return list.stream().limit(limit).toList();
    }

    /** Danh muc hay mua kem voi tung danh muc (dung khi chua co du du lieu don hang) */
    private static final Map<String, List<String>> COMPLEMENTS = Map.of(
            "dien-thoai", List.of("phu-kien", "tai-nghe", "dong-ho"),
            "laptop", List.of("phu-kien", "tai-nghe"),
            "may-anh", List.of("phu-kien"),
            "tai-nghe", List.of("phu-kien", "dien-thoai"),
            "dong-ho", List.of("phu-kien", "dien-thoai"),
            "phu-kien", List.of());

    /**
     * Goi y "Thuong mua kem": 1) admin chon -> 2) hay xuat hien chung don hang -> 3) danh muc bo tro.
     * Chi lay san pham khac danh muc, dang ban, con hang.
     */
    public List<Product> addOns(Product p, int limit) {
        Map<String, Product> out = new LinkedHashMap<>();
        java.util.function.Predicate<Product> ok = x -> x.isActive() && x.getStock() > 0
                && !x.getId().equals(p.getId()) && !out.containsKey(x.getId());

        if (p.getAddOnIds() != null) repo.findAllById(p.getAddOnIds()).forEach(x -> { if (ok.test(x)) out.put(x.getId(), x); });

        if (out.size() < limit) {
            Query q = new Query(Criteria.where("items.productId").is(p.getId()).and("status").ne(OrderStatus.CANCELLED)).limit(300);
            Map<String, Integer> together = new HashMap<>();
            for (Order o : mongo.find(q, Order.class))
                for (Order.Item i : o.getItems())
                    if (!i.getProductId().equals(p.getId())) together.merge(i.getProductId(), 1, Integer::sum);
            Map<String, Product> byId = new HashMap<>();
            repo.findAllById(together.keySet()).forEach(x -> byId.put(x.getId(), x));
            together.entrySet().stream().sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                    .map(e -> byId.get(e.getKey()))
                    .filter(x -> x != null && !x.getCategory().equals(p.getCategory()) && ok.test(x))
                    .limit(limit - out.size()).forEach(x -> out.put(x.getId(), x));
        }

        if (out.size() < limit) {
            // chi lay mon re hon may chinh (do "di kem"); moi danh muc mot hang doi (cung hang, ban chay len truoc), lay xen ke
            Comparator<Product> rank = Comparator.<Product>comparingInt(x -> x.getBrand().equalsIgnoreCase(p.getBrand()) || "ReTech".equals(x.getBrand()) ? 0 : 1)
                    .thenComparing(Comparator.comparingInt(Product::getSoldCount).reversed());
            List<Deque<Product>> queues = new ArrayList<>();
            for (String cat : COMPLEMENTS.getOrDefault(p.getCategory(), List.of()))
                queues.add(new ArrayDeque<>(repo.findByCategoryAndActiveTrue(cat).stream()
                        .filter(x -> x.getPrice() <= p.getPrice()).sorted(rank).toList()));
            while (out.size() < limit && queues.stream().anyMatch(qq -> !qq.isEmpty()))
                for (Deque<Product> qq : queues) {
                    while (!qq.isEmpty() && !ok.test(qq.peek())) qq.poll();
                    Product x = qq.poll();
                    if (x != null && out.size() < limit) out.put(x.getId(), x);
                }
        }
        return new ArrayList<>(out.values());
    }

    public List<Product> featured() {
        return repo.findByActiveTrueAndFeaturedTrue();
    }

    public List<BrandInfo> brands(String category) {
        Map<String, Long> counts = new TreeMap<>();
        for (Product p : category == null ? repo.findAll() : repo.findByCategoryAndActiveTrue(category)) {
            if (p.isActive()) counts.merge(p.getBrand(), 1L, Long::sum);
        }
        return counts.entrySet().stream()
                .map(e -> new BrandInfo(e.getKey(), TextUtil.slugify(e.getKey()), e.getValue())).toList();
    }

    // ---------- Admin ----------
    public Product create(ProductRequest req) {
        Product p = new Product();
        apply(p, req);
        p.setSlug(uniqueSlug(req.slug() != null && !req.slug().isBlank() ? req.slug() : req.name() + " " + Optional.ofNullable(req.variant()).orElse(""), null));
        return save(p);
    }

    public Product update(String id, ProductRequest req) {
        Product p = repo.findById(id).orElseThrow(() -> ApiException.notFound("sản phẩm"));
        apply(p, req);
        if (req.slug() != null && !req.slug().isBlank() && !req.slug().equals(p.getSlug()))
            p.setSlug(uniqueSlug(req.slug(), id));
        return save(p);
    }

    public void delete(String id) {
        if (!repo.existsById(id)) throw ApiException.notFound("sản phẩm");
        repo.deleteById(id);
    }

    public Product save(Product p) {
        p.setSearchText(TextUtil.normalize(String.join(" ",
                Objects.toString(p.getName(), ""), Objects.toString(p.getBrand(), ""),
                Objects.toString(p.getModel(), ""), Objects.toString(p.getVariant(), ""),
                Objects.toString(p.getCategory(), ""), String.join(" ", p.getTags()))));
        return repo.save(p);
    }

    private void apply(Product p, ProductRequest r) {
        p.setName(r.name().trim());
        p.setCategory(r.category());
        p.setBrand(r.brand());
        p.setModel(r.model());
        p.setVariant(r.variant());
        p.setCondition(r.condition());
        p.setBatteryHealth(r.batteryHealth());
        p.setPrice(r.price());
        p.setOriginalPrice(r.originalPrice());
        p.setStock(r.stock());
        p.setWarrantyMonths(r.warrantyMonths());
        p.setImages(r.images() != null ? new ArrayList<>(r.images()) : new ArrayList<>());
        p.setSpecs(r.specs() != null ? new LinkedHashMap<>(r.specs()) : new LinkedHashMap<>());
        p.setHighlights(r.highlights() != null ? new ArrayList<>(r.highlights()) : new ArrayList<>());
        p.setDescription(r.description());
        p.setTags(r.tags() != null ? new ArrayList<>(r.tags()) : new ArrayList<>());
        p.setReleaseYear(r.releaseYear());
        p.setFeatured(r.featured());
        if (r.active() != null) p.setActive(r.active());
        if (r.freeShipping() != null) p.setFreeShipping(r.freeShipping());
        if (r.addOnIds() != null) p.setAddOnIds(r.addOnIds().stream().distinct().filter(id -> !id.equals(p.getId())).toList());
    }

    private String uniqueSlug(String base, String selfId) {
        String slug = TextUtil.slugify(base);
        String candidate = slug;
        int i = 2;
        while (true) {
            Optional<Product> ex = repo.findBySlug(candidate);
            if (ex.isEmpty() || ex.get().getId().equals(selfId)) return candidate;
            candidate = slug + "-" + i++;
        }
    }
}
