package com.retech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.retech.dto.AiDtos.*;
import com.retech.model.*;
import com.retech.repository.ChatLogRepository;
import com.retech.repository.FaqRepository;
import com.retech.repository.ProductRepository;
import com.retech.security.AuthUser;
import com.retech.security.CurrentUser;
import com.retech.util.TextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Chatbot tu van: tim san pham lien quan trong kho (retrieval) -> dua vao ngu canh cho Gemini (RAG don gian).
 */
@Service
@RequiredArgsConstructor
public class ChatbotService {
    private final ProductRepository productRepo;
    private final FaqRepository faqRepo;
    private final ChatLogRepository chatLogRepo;
    private final SettingsService settingsService;
    private final GeminiClient gemini;

    private static final Map<String, String> CATEGORY_WORDS = Map.of(
            "dien thoai", "dien-thoai", "iphone", "dien-thoai", "smartphone", "dien-thoai",
            "laptop", "laptop", "macbook", "laptop", "may tinh", "laptop",
            "may anh", "may-anh", "camera", "may-anh",
            "tai nghe", "tai-nghe", "airpods", "tai-nghe");
    private static final Map<String, String> CATEGORY_WORDS_2 = Map.of(
            "dong ho", "dong-ho", "watch", "dong-ho", "smartwatch", "dong-ho", "headphone", "tai-nghe");

    public ChatResponse chat(ChatRequest req) {
        List<ChatMessage> history = req.messages().stream()
                .skip(Math.max(0, req.messages().size() - 12)).toList();
        String question = history.get(history.size() - 1).content();
        // gom 2 cau user gan nhat de giu ngu canh ("con mau khac khong?")
        String context = history.stream().filter(m -> "user".equals(m.role()))
                .skip(Math.max(0, history.stream().filter(m -> "user".equals(m.role())).count() - 2))
                .map(ChatMessage::content).collect(Collectors.joining(" "));

        List<Product> candidates = retrieve(context, 8);

        ChatResponse res = null;
        if (gemini.enabled()) res = askGemini(history, candidates);
        if (res == null) res = fallback(question, candidates);

        AuthUser u = CurrentUser.getOrNull();
        chatLogRepo.save(ChatLog.builder()
                .sessionId(req.sessionId())
                .userId(u != null ? u.id() : null)
                .question(question)
                .answer(res.reply())
                .productIds(res.products().stream().map(Product::getId).toList())
                .source(res.source())
                .build());
        return res;
    }

    // ---------------- Retrieval ----------------
    record PriceHint(Long min, Long max) {}

    PriceHint parsePrice(String norm) {
        // "duoi 10 trieu", "tren 5tr", "tam 15 trieu", "tu 5 den 10 trieu"
        Matcher range = Pattern.compile("tu\\s*(\\d+(?:[.,]\\d+)?)\\s*(?:tr|trieu|m)?\\s*(?:den|-|toi)\\s*(\\d+(?:[.,]\\d+)?)\\s*(tr|trieu|m)").matcher(norm);
        if (range.find()) return new PriceHint(mil(range.group(1)), mil(range.group(2)));
        Matcher m = Pattern.compile("(duoi|toi da|tren|tu|tam|khoang|gia)?\\s*(\\d+(?:[.,]\\d+)?)\\s*(tr|trieu|m)\\b").matcher(norm);
        if (m.find()) {
            long v = mil(m.group(2));
            String w = m.group(1) == null ? "" : m.group(1);
            return switch (w) {
                case "duoi", "toi da" -> new PriceHint(null, v);
                case "tren", "tu" -> new PriceHint(v, null);
                default -> new PriceHint((long) (v * 0.8), (long) (v * 1.2));
            };
        }
        return new PriceHint(null, null);
    }

    private long mil(String s) {
        return Math.round(Double.parseDouble(s.replace(',', '.')) * 1_000_000);
    }

    List<Product> retrieve(String text, int limit) {
        String norm = TextUtil.normalize(text);
        Set<String> cats = new HashSet<>();
        CATEGORY_WORDS.forEach((k, v) -> { if (norm.contains(k)) cats.add(v); });
        CATEGORY_WORDS_2.forEach((k, v) -> { if (norm.contains(k)) cats.add(v); });
        PriceHint price = parsePrice(norm);
        Set<String> stop = Set.of("toi", "minh", "can", "mua", "muon", "co", "khong", "nao", "cho", "voi", "la", "va",
                "gia", "duoi", "tren", "khoang", "tam", "trieu", "tr", "shop", "ban", "con", "hang", "may", "cai", "nhe", "a", "oi",
                "tu", "van", "giup", "goi", "y", "tot", "nhat", "re", "dep");
        List<String> tokens = Arrays.stream(norm.split("[^a-z0-9]+"))
                .filter(t -> t.length() >= 2 && !stop.contains(t) && !t.matches("\\d+")).toList();

        List<Product> all = productRepo.findAll().stream().filter(p -> p.isActive() && p.getStock() > 0).toList();
        record Scored(Product p, double s) {}
        List<Scored> scored = new ArrayList<>();
        for (Product p : all) {
            String st = Objects.toString(p.getSearchText(), "");
            double s = 0;
            for (String t : tokens) if (st.contains(t)) s += t.length() >= 4 ? 2 : 1;
            if (!cats.isEmpty()) s += cats.contains(p.getCategory()) ? 3 : -5;
            if (price.min() != null && p.getPrice() < price.min()) s -= 4;
            if (price.max() != null && p.getPrice() > price.max()) s -= 4;
            if (price.min() != null || price.max() != null) s += 1;
            s += Math.min(p.getSoldCount(), 20) / 20.0; // uu tien ban chay
            scored.add(new Scored(p, s));
        }
        double best = scored.stream().mapToDouble(Scored::s).max().orElse(0);
        if (best <= 1.0) {
            // khong khop gi: tra ve san pham noi bat
            return all.stream().sorted(Comparator.comparingInt(Product::getSoldCount).reversed()).limit(limit).toList();
        }
        return scored.stream().filter(x -> x.s() > 0).sorted(Comparator.comparingDouble(Scored::s).reversed())
                .limit(limit).map(Scored::p).toList();
    }

    // ---------------- Gemini ----------------
    private ChatResponse askGemini(List<ChatMessage> history, List<Product> candidates) {
        SiteSettings st = settingsService.get();
        String faqs = faqRepo.findAllByOrderBySortOrderAsc().stream()
                .map(f -> "Q: " + f.getQuestion() + "\nA: " + f.getAnswer()).collect(Collectors.joining("\n"));
        String catalog = candidates.stream().map(p -> String.format(
                "{id:%s | %s %s | %s | tình trạng: %s | pin: %s | giá: %s (máy mới %s) | bảo hành %d tháng | còn %d}",
                p.getId(), p.getName(), Objects.toString(p.getVariant(), ""), p.getBrand(),
                p.getCondition() != null ? p.getCondition().label : "-",
                p.getBatteryHealth() != null ? p.getBatteryHealth() + "%" : "-",
                TextUtil.formatVnd(p.getPrice()), TextUtil.formatVnd(p.getOriginalPrice()),
                p.getWarrantyMonths(), p.getStock())).collect(Collectors.joining("\n"));

        String system = """
                Bạn là "ReTech AI" – trợ lý tư vấn của cửa hàng %s chuyên mua bán đồ công nghệ đã qua sử dụng
                (điện thoại, laptop, máy ảnh, tai nghe, đồng hồ của Apple, Samsung, Xiaomi, Sony, Canon).
                Phong cách: thân thiện, ngắn gọn (tối đa ~120 từ), xưng "mình", gọi khách là "bạn", tiếng Việt.
                QUY TẮC:
                - CHỈ giới thiệu sản phẩm có trong DANH SÁCH SẢN PHẨM bên dưới, không bịa sản phẩm/giá.
                - Khi gợi ý, nêu lý do phù hợp nhu cầu, so sánh ngắn nếu có nhiều lựa chọn.
                - Khách muốn BÁN/ĐỔI máy cũ: hướng dẫn vào trang "Thu cũ" (/thu-cu) để AI định giá tức thì.
                - Câu hỏi ngoài lĩnh vực: lịch sự từ chối và quay về tư vấn sản phẩm.
                THÔNG TIN CỬA HÀNG: hotline %s, email %s, địa chỉ %s, giờ mở cửa %s.
                Phí ship %s, miễn phí ship cho đơn từ %s. Thanh toán: chuyển khoản QR qua PayOS hoặc COD.
                CÂU HỎI THƯỜNG GẶP:
                %s
                DANH SÁCH SẢN PHẨM LIÊN QUAN (đang còn hàng):
                %s
                Trả về JSON: {"reply": "câu trả lời (có thể dùng **in đậm** và gạch đầu dòng)",
                 "productIds": ["id sản phẩm được nhắc tới, tối đa 4"],
                 "suggestions": ["2-3 câu hỏi gợi ý tiếp theo ngắn gọn"]}
                """.formatted(st.getStoreName(), st.getHotline(), st.getEmail(), st.getAddress(), st.getWorkingHours(),
                TextUtil.formatVnd(st.getShippingFee()), TextUtil.formatVnd(st.getFreeShipThreshold()),
                faqs, catalog.isBlank() ? "(không có)" : catalog);

        List<GeminiClient.Msg> msgs = history.stream()
                .dropWhile(m -> !"user".equals(m.role()))   // Gemini yeu cau bat dau bang luot user
                .map(m -> new GeminiClient.Msg(m.role(), m.content())).toList();
        if (msgs.isEmpty()) return null;
        JsonNode j = gemini.generateJson(system, msgs, 0.6);
        if (j == null || !j.hasNonNull("reply")) return null;

        Map<String, Product> byId = candidates.stream().collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));
        List<Product> picked = new ArrayList<>();
        for (JsonNode id : j.path("productIds")) {
            Product p = byId.get(id.asText());
            if (p != null && picked.size() < 4) picked.add(p);
        }
        List<String> sugg = new ArrayList<>();
        for (JsonNode s : j.path("suggestions")) if (sugg.size() < 3) sugg.add(s.asText());
        return new ChatResponse(j.path("reply").asText(), picked, sugg, "GEMINI");
    }

    // ---------------- Fallback (khong co API key) ----------------
    private ChatResponse fallback(String question, List<Product> candidates) {
        String n = TextUtil.normalize(question);
        if (n.matches(".*(ban may|thu mua|thu cu|doi may|dinh gia).*")) {
            return new ChatResponse("Bạn muốn bán hoặc đổi máy cũ? Vào trang **Thu cũ** để AI định giá ngay trong 10 giây nhé! "
                    + "Sau đó nhân viên sẽ liên hệ chốt giá.", List.of(),
                    List.of("Điện thoại dưới 10 triệu", "Laptop cho sinh viên", "Chính sách bảo hành"), "FALLBACK");
        }
        for (Faq f : faqRepo.findAllByOrderBySortOrderAsc()) {
            String q = TextUtil.normalize(f.getQuestion());
            long hit = Arrays.stream(q.split(" ")).filter(w -> w.length() > 3 && n.contains(w)).count();
            if (hit >= 2) return new ChatResponse(f.getAnswer(), List.of(),
                    List.of("Gợi ý điện thoại đáng mua", "Hình thức thanh toán"), "FALLBACK");
        }
        List<Product> top = candidates.stream().limit(3).toList();
        StringBuilder sb = new StringBuilder("Mình gợi ý cho bạn vài lựa chọn phù hợp:\n");
        for (Product p : top) sb.append("- **").append(p.getName()).append("** – ")
                .append(p.getCondition() != null ? p.getCondition().label : "").append(", giá ")
                .append(TextUtil.formatVnd(p.getPrice())).append("\n");
        sb.append("Bạn cần thêm thông tin máy nào không?");
        return new ChatResponse(sb.toString(), top, List.of("So sánh 2 máy này", "Có trả góp không?"), "FALLBACK");
    }
}
