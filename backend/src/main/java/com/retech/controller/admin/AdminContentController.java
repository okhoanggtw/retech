package com.retech.controller.admin;

import com.retech.dto.TradeInDtos.UpdateTradeInRequest;
import com.retech.exception.ApiException;
import com.retech.model.*;
import com.retech.repository.*;
import com.retech.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/** Admin: banner, menu, khuyen mai (sales), FAQ, danh muc, cai dat, lien he, thu mua, thong ke, upload */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminContentController {
    private final BannerRepository bannerRepo;
    private final MenuItemRepository menuRepo;
    private final PromotionRepository promotionRepo;
    private final FaqRepository faqRepo;
    private final CategoryRepository categoryRepo;
    private final ContactMessageRepository contactRepo;
    private final SettingsService settingsService;
    private final TradeInService tradeInService;
    private final StatsService statsService;
    private final FileService fileService;
    private final PayOSService payOSService;
    private final com.retech.config.AppProperties props;

    private static <T> T saveNew(MongoRepository<T, String> repo, T entity, Consumer<T> clearId) {
        clearId.accept(entity);
        return repo.save(entity);
    }

    private static <T> T saveExisting(MongoRepository<T, String> repo, String id, T entity, Consumer<T> setId) {
        if (!repo.existsById(id)) throw ApiException.notFound("bản ghi");
        setId.accept(entity);
        return repo.save(entity);
    }

    // ---------- Banner ----------
    @GetMapping("/banners") public List<Banner> banners() { return bannerRepo.findAllByOrderBySortOrderAsc(); }
    @PostMapping("/banners") public Banner createBanner(@RequestBody Banner b) { return saveNew(bannerRepo, b, x -> x.setId(null)); }
    @PutMapping("/banners/{id}") public Banner updateBanner(@PathVariable String id, @RequestBody Banner b) { return saveExisting(bannerRepo, id, b, x -> x.setId(id)); }
    @DeleteMapping("/banners/{id}") public void deleteBanner(@PathVariable String id) { bannerRepo.deleteById(id); }

    // ---------- Menu ----------
    @GetMapping("/menus") public List<MenuItem> menus() { return menuRepo.findAllByOrderBySortOrderAsc(); }
    @PostMapping("/menus") public MenuItem createMenu(@RequestBody MenuItem m) { return saveNew(menuRepo, m, x -> x.setId(null)); }
    @PutMapping("/menus/{id}") public MenuItem updateMenu(@PathVariable String id, @RequestBody MenuItem m) { return saveExisting(menuRepo, id, m, x -> x.setId(id)); }
    @DeleteMapping("/menus/{id}") public void deleteMenu(@PathVariable String id) { menuRepo.deleteById(id); }

    // ---------- Sales / khuyen mai ----------
    @GetMapping("/promotions") public List<Promotion> promotions() { return promotionRepo.findAll(Sort.by(Sort.Direction.DESC, "startAt")); }
    @PostMapping("/promotions") public Promotion createPromotion(@RequestBody Promotion p) {
        p.setCode(p.getCode().trim().toUpperCase());
        if (promotionRepo.findByCodeIgnoreCase(p.getCode()).isPresent()) throw ApiException.badRequest("Mã đã tồn tại");
        return saveNew(promotionRepo, p, x -> x.setId(null));
    }
    @PutMapping("/promotions/{id}") public Promotion updatePromotion(@PathVariable String id, @RequestBody Promotion p) {
        p.setCode(p.getCode().trim().toUpperCase());
        return saveExisting(promotionRepo, id, p, x -> x.setId(id));
    }
    @DeleteMapping("/promotions/{id}") public void deletePromotion(@PathVariable String id) { promotionRepo.deleteById(id); }

    // ---------- FAQ ----------
    @GetMapping("/faqs") public List<Faq> faqs() { return faqRepo.findAllByOrderBySortOrderAsc(); }
    @PostMapping("/faqs") public Faq createFaq(@RequestBody Faq f) { return saveNew(faqRepo, f, x -> x.setId(null)); }
    @PutMapping("/faqs/{id}") public Faq updateFaq(@PathVariable String id, @RequestBody Faq f) { return saveExisting(faqRepo, id, f, x -> x.setId(id)); }
    @DeleteMapping("/faqs/{id}") public void deleteFaq(@PathVariable String id) { faqRepo.deleteById(id); }

    // ---------- Danh muc ----------
    @PostMapping("/categories") public Category createCategory(@RequestBody Category c) { return saveNew(categoryRepo, c, x -> x.setId(null)); }
    @PutMapping("/categories/{id}") public Category updateCategory(@PathVariable String id, @RequestBody Category c) { return saveExisting(categoryRepo, id, c, x -> x.setId(id)); }

    // ---------- Cai dat cua hang & mang xa hoi ----------
    @GetMapping("/settings") public SiteSettings settings() { return settingsService.get(); }
    @PutMapping("/settings") public SiteSettings saveSettings(@RequestBody SiteSettings s) { return settingsService.save(s); }

    // ---------- Lien he ----------
    @GetMapping("/contacts") public List<ContactMessage> contacts() { return contactRepo.findAllByOrderByCreatedAtDesc(); }
    @PutMapping("/contacts/{id}/handled") public ContactMessage handled(@PathVariable String id) {
        ContactMessage c = contactRepo.findById(id).orElseThrow(() -> ApiException.notFound("liên hệ"));
        c.setHandled(true);
        return contactRepo.save(c);
    }

    // ---------- Thu mua ----------
    @GetMapping("/trade-ins") public List<TradeIn> tradeIns() { return tradeInService.all(); }
    @PutMapping("/trade-ins/{id}") public TradeIn updateTradeIn(@PathVariable String id, @RequestBody UpdateTradeInRequest req) { return tradeInService.update(id, req); }

    // ---------- Thong ke ----------
    @GetMapping("/stats") public StatsService.Overview stats(@RequestParam(defaultValue = "30") int days) {
        return statsService.overview(Math.max(7, Math.min(days, 365)));
    }

    // ---------- Upload anh ----------
    @PostMapping("/uploads")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String id = fileService.store(file);
        return Map.of("id", id, "url", "/api/files/" + id);
    }

    // ---------- PayOS ----------
    @PostMapping("/payos/confirm-webhook")
    public Object confirmWebhook() {
        if (payOSService.isDemoMode()) throw ApiException.badRequest("Chưa cấu hình PayOS");
        return payOSService.confirmWebhook(props.getBackendUrl() + "/api/payments/payos/webhook");
    }
}
