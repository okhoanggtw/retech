package com.retech.controller;

import com.retech.exception.ApiException;
import com.retech.model.*;
import com.retech.repository.*;
import com.retech.service.PromotionService;
import com.retech.service.SettingsService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Noi dung cong khai: banner, menu, FAQ, thong tin cua hang, lien he, khuyen mai */
@RestController
@RequiredArgsConstructor
public class ContentController {
    private final BannerRepository bannerRepo;
    private final MenuItemRepository menuRepo;
    private final FaqRepository faqRepo;
    private final ContactMessageRepository contactRepo;
    private final PromotionRepository promotionRepo;
    private final PromotionService promotionService;
    private final SettingsService settingsService;

    @GetMapping("/api/content/banners")
    public List<Banner> banners() {
        return bannerRepo.findByActiveTrueOrderBySortOrderAsc();
    }

    @GetMapping("/api/content/menus")
    public List<MenuItem> menus() {
        return menuRepo.findByActiveTrueOrderBySortOrderAsc();
    }

    @GetMapping("/api/content/faqs")
    public List<Faq> faqs() {
        return faqRepo.findAllByOrderBySortOrderAsc();
    }

    @GetMapping("/api/content/settings")
    public SiteSettings settings() {
        return settingsService.get();
    }

    @GetMapping("/api/content/promotions")
    public List<Promotion> promotions() {
        Instant now = Instant.now();
        return promotionRepo.findByActiveTrue().stream().filter(p -> p.isValidAt(now)).toList();
    }

    public record ContactRequest(@NotBlank(message = "Nhập họ tên") String fullName,
                                 @NotBlank(message = "Nhập email") @Email(message = "Email không hợp lệ") String email,
                                 String phone, String subject,
                                 @NotBlank(message = "Nhập nội dung") String message) {}

    @PostMapping("/api/content/contact")
    public Map<String, String> contact(@Valid @RequestBody ContactRequest req) {
        contactRepo.save(ContactMessage.builder().fullName(req.fullName()).email(req.email()).phone(req.phone())
                .subject(req.subject()).message(req.message()).build());
        return Map.of("message", "Cảm ơn bạn! Chúng tôi sẽ phản hồi trong vòng 24 giờ.");
    }

    public record CheckPromotionRequest(@NotBlank String code, long subtotal) {}

    @PostMapping("/api/promotions/check")
    public Map<String, Object> checkPromotion(@Valid @RequestBody CheckPromotionRequest req) {
        try {
            Promotion p = promotionService.validate(req.code(), req.subtotal());
            return Map.of("valid", true, "code", p.getCode(), "name", p.getName(), "discount", p.calcDiscount(req.subtotal()));
        } catch (ApiException e) {
            return Map.of("valid", false, "message", e.getMessage());
        }
    }
}
