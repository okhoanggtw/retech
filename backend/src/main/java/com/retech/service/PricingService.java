package com.retech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.retech.dto.AiDtos.DeviceInfo;
import com.retech.exception.ApiException;
import com.retech.model.*;
import com.retech.model.AiPriceSuggestion.Factor;
import com.retech.repository.CategoryRepository;
import com.retech.repository.ProductRepository;
import com.retech.util.TextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Year;
import java.util.*;

/**
 * AI DINH GIA = Cong thuc khau hao (co so) + Du lieu san pham tuong tu trong kho + Gemini (lap luan & tinh chinh).
 * Gemini bi gioi han trong +/-30% so voi cong thuc de tranh "bia" gia.
 */
@Service
@RequiredArgsConstructor
public class PricingService {
    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final GeminiClient gemini;

    /** Bien loi nhuan khi shop thu mua: tra khach 68% - 75% gia ban lai */
    private static final double BUY_LOW = 0.68, BUY_HIGH = 0.75;
    private static final double GEMINI_CLAMP = 0.30;

    public AiPriceSuggestion estimate(DeviceInfo d) {
        List<Product> comparables = findComparables(d);
        Formula f = formula(d, comparables);

        AiPriceSuggestion result = fromFormula(f);
        if (gemini.enabled()) {
            AiPriceSuggestion ai = askGemini(d, f, comparables);
            if (ai != null) result = ai;
        }
        if (result.getSuggestedPrice() <= 0)
            throw ApiException.badRequest("Chưa đủ dữ liệu để định giá model này, vui lòng nhập giá máy mới tham khảo");
        result.setCreatedAt(Instant.now());
        return result;
    }

    // ------------------------------------------------------------------
    // 1) San pham tuong tu trong kho
    // ------------------------------------------------------------------
    List<Product> findComparables(DeviceInfo d) {
        String modelNorm = TextUtil.normalize(d.model());
        List<String> tokens = Arrays.stream(modelNorm.split(" ")).filter(t -> !t.isBlank()).toList();
        List<Product> pool = productRepo.findByBrandIgnoreCaseAndCategoryAndActiveTrue(d.brand(), d.category());
        List<Product> matched = new ArrayList<>();
        for (Product p : pool) {
            String m = TextUtil.normalize(Objects.toString(p.getModel(), p.getName()));
            // model cua san pham phai chua toan bo token cua model khach nhap va nguoc lai (khop chinh xac doi may)
            List<String> pt = Arrays.stream(m.split(" ")).filter(t -> !t.isBlank()).toList();
            if (new HashSet<>(pt).containsAll(tokens) && new HashSet<>(tokens).containsAll(pt)) matched.add(p);
        }
        return matched;
    }

    // ------------------------------------------------------------------
    // 2) Cong thuc khau hao
    // ------------------------------------------------------------------
    record Formula(long newPrice, String newPriceSource, int years, double retention, double conditionFactor,
                   double batteryFactor, double issueFactor, double accessoryFactor,
                   long formulaPrice, Long marketPrice, long resale, List<Factor> factors) {}

    Formula formula(DeviceInfo d, List<Product> comparables) {
        int nowYear = Year.now().getValue();
        List<Factor> factors = new ArrayList<>();

        // Gia may moi
        long newPrice;
        String src;
        if (d.referenceNewPrice() != null && d.referenceNewPrice() > 0) {
            newPrice = d.referenceNewPrice();
            src = "khách cung cấp";
        } else if (!comparables.isEmpty()) {
            newPrice = (long) comparables.stream().mapToLong(Product::getOriginalPrice).filter(x -> x > 0).average().orElse(0);
            src = "giá máy mới trong dữ liệu cửa hàng";
        } else {
            newPrice = 0;
            src = "chưa có";
        }
        if (newPrice <= 0) {
            if (!gemini.enabled())
                throw ApiException.badRequest("Chưa có dữ liệu giá cho model này, vui lòng nhập giá máy mới tham khảo");
            newPrice = 0;
        }

        Integer releaseYear = comparables.stream().map(Product::getReleaseYear).filter(y -> y > 0).findFirst().orElse(null);
        int fromYear = d.purchaseYear() != null ? d.purchaseYear() : (releaseYear != null ? releaseYear : nowYear - 1);
        int years = Math.max(0, nowYear - fromYear);
        double retention = categoryRepo.findBySlug(d.category()).map(Category::getYearlyRetention)
                .filter(x -> x > 0).orElse(0.8);
        double ageFactor = 0.92 * Math.pow(retention, years); // mat 8% ngay khi "dap hop"
        factors.add(new Factor("Tuổi máy", pct(ageFactor), years + " năm, giữ giá " + Math.round(retention * 100) + "%/năm"));

        ConditionGrade cg = d.condition();
        double condF = cg.factor;
        factors.add(new Factor("Ngoại hình", pct(condF), cg.label));

        double batF = 1.0;
        if (d.batteryHealth() != null) {
            int b = d.batteryHealth();
            batF = b >= 90 ? 1.0 : b >= 85 ? 0.97 : b >= 80 ? 0.93 : 0.85;
            factors.add(new Factor("Pin", pct(batF), "Dung lượng pin " + b + "%"));
        }

        double issueF = 1.0;
        List<String> issues = d.issues() == null ? List.of() : d.issues();
        for (String is : issues) {
            String n = TextUtil.normalize(is);
            double minus = n.contains("man hinh") ? 0.18 : n.contains("face") || n.contains("van tay") ? 0.15
                    : n.contains("camera") || n.contains("ong kinh") ? 0.12 : 0.08;
            issueF -= minus;
        }
        issueF = Math.max(0.45, issueF);
        if (!issues.isEmpty()) factors.add(new Factor("Lỗi chức năng", pct(issueF), String.join(", ", issues)));

        double accF = 1.0;
        List<String> acc = d.accessories() == null ? List.of() : d.accessories();
        if (acc.size() >= 2) accF = 1.03;
        else if (acc.isEmpty()) accF = 0.98;
        factors.add(new Factor("Phụ kiện", pct(accF), acc.isEmpty() ? "Chỉ có máy" : String.join(", ", acc)));

        long formulaPrice = round100k(newPrice * ageFactor * condF * batF * issueF * accF);

        // Gia thi truong tu kho (quy doi ve cung tinh trang)
        Long market = null;
        if (!comparables.isEmpty()) {
            final double adjust = condF * batF * issueF;
            double avg = comparables.stream().mapToDouble(p -> {
                double pf = p.getCondition() != null ? p.getCondition().factor : 1.0;
                return p.getPrice() / pf * adjust;
            }).average().orElse(0);
            market = round100k(avg);
        }
        long resale = market == null ? formulaPrice : round100k(formulaPrice * 0.5 + market * 0.5);
        return new Formula(newPrice, src, years, retention, condF, batF, issueF, accF, formulaPrice, market, resale, factors);
    }

    private AiPriceSuggestion fromFormula(Formula f) {
        String exp = "Giá máy mới " + TextUtil.formatVnd(f.newPrice()) + " (" + f.newPriceSource() + "). "
                + "Theo công thức khấu hao: " + TextUtil.formatVnd(f.formulaPrice())
                + (f.marketPrice() != null ? "; giá máy tương tự đang bán tại cửa hàng (quy đổi): " + TextUtil.formatVnd(f.marketPrice())
                + " ⇒ lấy trung bình." : ".");
        return AiPriceSuggestion.builder()
                .suggestedPrice(f.resale())
                .minPrice(round100k(f.resale() * 0.93))
                .maxPrice(round100k(f.resale() * 1.07))
                .buyPriceLow(round100k(f.resale() * BUY_LOW))
                .buyPriceHigh(round100k(f.resale() * BUY_HIGH))
                .confidence(f.marketPrice() != null ? 0.8 : 0.6)
                .explanation(exp)
                .factors(f.factors())
                .source("FORMULA")
                .build();
    }

    // ------------------------------------------------------------------
    // 3) Gemini tinh chinh
    // ------------------------------------------------------------------
    private AiPriceSuggestion askGemini(DeviceInfo d, Formula f, List<Product> comparables) {
        String system = """
                Bạn là chuyên gia định giá đồ công nghệ cũ tại thị trường Việt Nam (năm %d) cho cửa hàng ReTech.
                Nhiệm vụ: ước tính GIÁ BÁN LẠI hợp lý (VND) của thiết bị đã qua sử dụng.
                Dựa trên: thông tin thiết bị, kết quả công thức khấu hao nội bộ và các máy tương tự đang bán tại cửa hàng.
                Nếu giá máy mới = 0 (chưa có dữ liệu), hãy tự ước tính giá máy mới chính hãng tại Việt Nam.
                Chỉ trả về JSON đúng schema:
                {"newPriceEstimate": number, "suggestedPrice": number, "minPrice": number, "maxPrice": number,
                 "confidence": number (0-1), "explanation": "2-4 câu tiếng Việt, nêu lý do chính",
                 "factors": [{"name": string, "impact": "vd -12%%", "note": string}]}
                """.formatted(Year.now().getValue());
        StringBuilder u = new StringBuilder();
        u.append("THIẾT BỊ:\n")
                .append("- Danh mục: ").append(d.category()).append("\n")
                .append("- Hãng/Model: ").append(d.brand()).append(" ").append(d.model())
                .append(d.storage() != null ? " " + d.storage() : "").append("\n")
                .append("- Năm mua: ").append(d.purchaseYear() != null ? d.purchaseYear() : "không rõ").append("\n")
                .append("- Ngoại hình: ").append(d.condition().label).append("\n")
                .append("- Pin: ").append(d.batteryHealth() != null ? d.batteryHealth() + "%" : "không rõ").append("\n")
                .append("- Lỗi: ").append(d.issues() == null || d.issues().isEmpty() ? "không" : String.join(", ", d.issues())).append("\n")
                .append("- Phụ kiện: ").append(d.accessories() == null || d.accessories().isEmpty() ? "chỉ có máy" : String.join(", ", d.accessories())).append("\n")
                .append("- Ghi chú: ").append(Objects.toString(d.note(), "")).append("\n\n")
                .append("CÔNG THỨC NỘI BỘ:\n")
                .append("- Giá máy mới: ").append(f.newPrice()).append(" (").append(f.newPriceSource()).append(")\n")
                .append("- Hệ số: tuổi ").append(String.format("%.2f", 0.92 * Math.pow(f.retention(), f.years())))
                .append(", ngoại hình ").append(f.conditionFactor())
                .append(", pin ").append(f.batteryFactor())
                .append(", lỗi ").append(String.format("%.2f", f.issueFactor()))
                .append(", phụ kiện ").append(f.accessoryFactor()).append("\n")
                .append("- Giá theo công thức: ").append(f.formulaPrice()).append("\n");
        if (!comparables.isEmpty()) {
            u.append("\nMÁY TƯƠNG TỰ ĐANG BÁN TẠI CỬA HÀNG:\n");
            comparables.stream().limit(6).forEach(p -> u.append("- ").append(p.getName())
                    .append(p.getVariant() != null ? " " + p.getVariant() : "")
                    .append(" | ").append(p.getCondition() != null ? p.getCondition().label : "")
                    .append(" | pin ").append(p.getBatteryHealth() != null ? p.getBatteryHealth() + "%" : "-")
                    .append(" | giá ").append(p.getPrice()).append("\n"));
        }

        JsonNode j = gemini.generateJson(system, List.of(new GeminiClient.Msg("user", u.toString())), 0.2);
        if (j == null || !j.has("suggestedPrice")) return null;

        long base = f.resale();
        if (base <= 0) base = j.path("newPriceEstimate").asLong(0) > 0
                ? round100k(j.path("newPriceEstimate").asLong() * 0.92 * Math.pow(f.retention(), f.years())
                * f.conditionFactor() * f.batteryFactor() * f.issueFactor() * f.accessoryFactor())
                : j.path("suggestedPrice").asLong();
        long suggested = clamp(j.path("suggestedPrice").asLong(), base);
        if (suggested <= 0) return null;

        List<Factor> factors = new ArrayList<>();
        if (j.path("factors").isArray()) {
            for (JsonNode x : j.path("factors"))
                factors.add(new Factor(x.path("name").asText(), x.path("impact").asText(), x.path("note").asText()));
        }
        if (factors.isEmpty()) factors = f.factors();

        return AiPriceSuggestion.builder()
                .suggestedPrice(round100k(suggested))
                .minPrice(round100k(Math.min(suggested, clamp(j.path("minPrice").asLong(suggested), base))))
                .maxPrice(round100k(Math.max(suggested, clamp(j.path("maxPrice").asLong(suggested), base))))
                .buyPriceLow(round100k(suggested * BUY_LOW))
                .buyPriceHigh(round100k(suggested * BUY_HIGH))
                .confidence(Math.max(0, Math.min(1, j.path("confidence").asDouble(0.7))))
                .explanation(j.path("explanation").asText())
                .factors(factors)
                .source("GEMINI")
                .build();
    }

    private long clamp(long value, long base) {
        if (base <= 0) return value;
        long lo = (long) (base * (1 - GEMINI_CLAMP)), hi = (long) (base * (1 + GEMINI_CLAMP));
        return Math.max(lo, Math.min(hi, value));
    }

    static long round100k(double v) {
        return Math.round(v / 100_000.0) * 100_000L;
    }

    private static String pct(double factor) {
        long p = Math.round((factor - 1) * 100);
        return (p >= 0 ? "+" : "") + p + "%";
    }
}
