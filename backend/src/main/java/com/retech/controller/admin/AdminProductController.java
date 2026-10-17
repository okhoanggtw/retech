package com.retech.controller.admin;

import com.retech.dto.AiDtos.DeviceInfo;
import com.retech.dto.ProductDtos.*;
import com.retech.model.AiPriceSuggestion;
import com.retech.model.ConditionGrade;
import com.retech.model.Product;
import com.retech.service.PricingService;
import com.retech.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {
    private final ProductService productService;
    private final PricingService pricingService;

    @GetMapping
    public PageResponse<Product> list(@RequestParam(required = false) String q,
                                      @RequestParam(required = false) String category,
                                      @RequestParam(required = false) String brand,
                                      @RequestParam(defaultValue = "newest") String sort,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        List<String> brands = brand == null || brand.isBlank() ? null : Arrays.asList(brand.split(","));
        return productService.search(new ProductService.SearchParams(q, category, brands, null, null, null, sort, true, page, size));
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable String id) {
        return productService.getBySlugOrId(id);
    }

    @PostMapping
    public Product create(@Valid @RequestBody ProductRequest req) {
        return productService.create(req);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable String id, @Valid @RequestBody ProductRequest req) {
        return productService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable String id) {
        productService.delete(id);
        return Map.of("message", "Đã xóa sản phẩm");
    }

    /** AI goi y gia ban cho san pham dang nhap (form them/sua) */
    @PostMapping("/ai-suggest")
    public AiPriceSuggestion suggest(@Valid @RequestBody DeviceInfo device) {
        return pricingService.estimate(device);
    }

    /** AI goi y gia cho san pham da co va luu lai ket qua */
    @PostMapping("/{id}/ai-suggest")
    public Product suggestFor(@PathVariable String id) {
        Product p = productService.getBySlugOrId(id);
        DeviceInfo d = new DeviceInfo(p.getCategory(), p.getBrand(), p.getModel() != null ? p.getModel() : p.getName(),
                p.getVariant(), p.getReleaseYear() > 0 ? p.getReleaseYear() : Year.now().getValue() - 1,
                p.getCondition() != null ? p.getCondition() : ConditionGrade.GOOD, p.getBatteryHealth(),
                List.of(), List.of("Hộp", "Sạc"), p.getOriginalPrice() > 0 ? p.getOriginalPrice() : null, null);
        p.setAiSuggestion(pricingService.estimate(d));
        return productService.save(p);
    }
}
