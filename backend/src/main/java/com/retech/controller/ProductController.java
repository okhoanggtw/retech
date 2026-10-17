package com.retech.controller;

import com.retech.dto.ProductDtos.*;
import com.retech.model.Category;
import com.retech.model.ConditionGrade;
import com.retech.model.Product;
import com.retech.repository.CategoryRepository;
import com.retech.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final CategoryRepository categoryRepo;

    /** Tim kiem / loc san pham. vd: /api/products?q=iphone&category=dien-thoai&brand=Apple,Samsung&minPrice=5000000&sort=price_asc */
    @GetMapping("/products")
    public PageResponse<Product> search(@RequestParam(required = false) String q,
                                        @RequestParam(required = false) String category,
                                        @RequestParam(required = false) String brand,
                                        @RequestParam(required = false) String condition,
                                        @RequestParam(required = false) Long minPrice,
                                        @RequestParam(required = false) Long maxPrice,
                                        @RequestParam(defaultValue = "newest") String sort,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "12") int size) {
        List<String> brands = brand == null || brand.isBlank() ? null : Arrays.stream(brand.split(",")).map(String::trim).toList();
        List<ConditionGrade> conds = condition == null || condition.isBlank() ? null
                : Arrays.stream(condition.split(",")).map(String::trim).map(ConditionGrade::valueOf).toList();
        return productService.search(new ProductService.SearchParams(q, category, brands, conds, minPrice, maxPrice, sort, false, page, size));
    }

    @GetMapping("/products/featured")
    public List<Product> featured() {
        return productService.featured();
    }

    @GetMapping("/products/{slug}")
    public Map<String, Object> detail(@PathVariable String slug) {
        Product p = productService.viewBySlug(slug);
        return Map.of("product", p, "related", productService.related(p, 8));
    }

    @GetMapping("/categories")
    public List<Category> categories() {
        return categoryRepo.findAllByOrderBySortOrderAsc();
    }

    @GetMapping("/brands")
    public List<BrandInfo> brands(@RequestParam(required = false) String category) {
        return productService.brands(category);
    }

    @GetMapping("/products/meta/conditions")
    public List<Map<String, Object>> conditions() {
        return Arrays.stream(ConditionGrade.values())
                .map(c -> Map.<String, Object>of("value", c.name(), "label", c.label, "factor", c.factor)).toList();
    }
}
