package com.retech.config;

import com.retech.model.*;
import com.retech.repository.*;
import com.retech.service.ProductService;
import com.retech.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static com.retech.model.ConditionGrade.*;

/** Tao du lieu mau lan dau chay (chi chay khi DB trong) */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final AppProperties props;
    private final PasswordEncoder encoder;
    private final UserRepository userRepo;
    private final CategoryRepository categoryRepo;
    private final ProductRepository productRepo;
    private final ProductService productService;
    private final BannerRepository bannerRepo;
    private final MenuItemRepository menuRepo;
    private final PromotionRepository promotionRepo;
    private final FaqRepository faqRepo;
    private final OrderRepository orderRepo;
    private final TradeInRepository tradeInRepo;
    private final SettingsService settingsService;

    @Override
    public void run(String... args) {
        ensureAdmin();
        if (!props.isSeedData() || productRepo.count() > 0) return;
        log.info("==> Dang tao du lieu mau...");
        seedSettings();
        seedCategories();
        seedProducts();
        seedBanners();
        seedMenus();
        seedPromotions();
        seedFaqs();
        seedOrders();
        log.info("==> Xong du lieu mau: {} san pham, {} don hang", productRepo.count(), orderRepo.count());
    }

    private void ensureAdmin() {
        String email = props.getAdmin().getEmail().toLowerCase();
        if (userRepo.existsByEmailIgnoreCase(email)) return;
        userRepo.save(User.builder().fullName("Quản trị viên").email(email)
                .passwordHash(encoder.encode(props.getAdmin().getPassword())).role(Role.ADMIN).build());
        log.info("==> Tao tai khoan admin: {}", email);
    }

    private void seedSettings() {
        Map<String, String> socials = new LinkedHashMap<>();
        socials.put("facebook", "https://facebook.com/retech.vn");
        socials.put("instagram", "https://instagram.com/retech.vn");
        socials.put("tiktok", "https://tiktok.com/@retech.vn");
        socials.put("youtube", "https://youtube.com/@retechvn");
        socials.put("zalo", "https://zalo.me/0912345678");
        settingsService.save(SiteSettings.builder()
                .storeName("ReTech").slogan("Công nghệ đã qua sử dụng. Chất lượng như mới.")
                .hotline("1900 6868").email("hotro@retech.vn")
                .address("122 Hoàng Quốc Việt, Cầu Giấy, Hà Nội").workingHours("8:30 – 21:30 (cả T7, CN)")
                .mapEmbedUrl("https://www.google.com/maps?q=Hoc+vien+Cong+nghe+Buu+chinh+Vien+thong&output=embed")
                .shippingFee(30000).freeShipThreshold(2000000).socials(socials).build());
    }

    private void seedCategories() {
        categoryRepo.saveAll(List.of(
                Category.builder().name("Điện thoại").slug("dien-thoai").icon("smartphone").yearlyRetention(0.80).sortOrder(1)
                        .description("iPhone, Samsung Galaxy, Xiaomi đã qua kiểm định 30 bước").build(),
                Category.builder().name("Laptop").slug("laptop").icon("laptop").yearlyRetention(0.82).sortOrder(2)
                        .description("MacBook và laptop cao cấp, pin và bàn phím được kiểm tra kỹ").build(),
                Category.builder().name("Máy ảnh").slug("may-anh").icon("camera").yearlyRetention(0.88).sortOrder(3)
                        .description("Máy ảnh Sony, Canon kèm thông số shutter count minh bạch").build(),
                Category.builder().name("Tai nghe").slug("tai-nghe").icon("headphones").yearlyRetention(0.75).sortOrder(4)
                        .description("AirPods, Sony, Galaxy Buds chính hãng").build(),
                Category.builder().name("Đồng hồ").slug("dong-ho").icon("watch").yearlyRetention(0.78).sortOrder(5)
                        .description("Apple Watch, Galaxy Watch, Xiaomi Watch").build(),
                Category.builder().name("Phụ kiện").slug("phu-kien").icon("package").yearlyRetention(0.7).sortOrder(6)
                        .description("Phụ kiện vệ sinh, bảo vệ máy").build()));
    }

    private Product p(String category, String brand, String model, String variant, ConditionGrade cond, Integer battery,
                      long price, long original, int stock, int year, boolean featured, int sold,
                      Map<String, String> specs, List<String> highlights, String... tags) {
        return Product.builder()
                .name(brand.equals("Apple") || model.startsWith(brand) ? model : brand + " " + model)
                .category(category).brand(brand).model(model).variant(variant).condition(cond).batteryHealth(battery)
                .price(price).originalPrice(original).stock(stock).releaseYear(year).featured(featured).soldCount(sold)
                .warrantyMonths(category.equals("may-anh") ? 6 : 12)
                .specs(new LinkedHashMap<>(specs)).highlights(new ArrayList<>(highlights)).tags(new ArrayList<>(List.of(tags)))
                .description("Máy " + cond.label.toLowerCase() + ", đã qua kiểm định 30 bước tại ReTech. "
                        + "Bảo hành " + (category.equals("may-anh") ? 6 : 12) + " tháng, 1 đổi 1 trong 30 ngày nếu lỗi phần cứng.")
                .build();
    }

    private static Map<String, String> s(String... kv) {
        Map<String, String> m = new LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) m.put(kv[i], kv[i + 1]);
        return m;
    }

    private void seedProducts() {
        List<Product> list = List.of(
            // ---------- Dien thoai ----------
            p("dien-thoai", "Apple", "iPhone 16 Pro Max", "256GB - Titan Sa Mạc", LIKE_NEW, 98, 27_990_000, 34_990_000, 3, 2024, true, 41,
                s("Màn hình", "6.9\" Super Retina XDR, 120Hz", "Chip", "A18 Pro", "RAM", "8GB", "Camera", "48MP + 48MP + 12MP (5x)", "Pin", "4685 mAh"),
                List.of("Camera Control mới", "Quay 4K 120fps Dolby Vision", "Khung titan cấp 5"), "iphone", "flagship"),
            p("dien-thoai", "Apple", "iPhone 16 Pro", "128GB - Titan Trắng", EXCELLENT, 95, 21_490_000, 28_990_000, 2, 2024, false, 23,
                s("Màn hình", "6.3\" Super Retina XDR, 120Hz", "Chip", "A18 Pro", "RAM", "8GB", "Camera", "48MP + 48MP + 12MP (5x)"),
                List.of("Nhỏ gọn nhưng đủ sức mạnh Pro", "Apple Intelligence"), "iphone"),
            p("dien-thoai", "Apple", "iPhone 15 Pro Max", "256GB - Titan Tự Nhiên", EXCELLENT, 89, 21_990_000, 34_990_000, 4, 2023, true, 67,
                s("Màn hình", "6.7\" Super Retina XDR, 120Hz", "Chip", "A17 Pro", "RAM", "8GB", "Camera", "48MP + 12MP + 12MP (5x)"),
                List.of("Cổng USB‑C", "Nút Action", "Zoom quang 5x"), "iphone", "flagship"),
            p("dien-thoai", "Apple", "iPhone 15", "128GB - Hồng", GOOD, 91, 13_490_000, 22_990_000, 5, 2023, false, 52,
                s("Màn hình", "6.1\" Super Retina XDR", "Chip", "A16 Bionic", "Camera", "48MP + 12MP"),
                List.of("Dynamic Island", "Camera 48MP"), "iphone"),
            p("dien-thoai", "Apple", "iPhone 14 Pro", "128GB - Tím", GOOD, 86, 14_290_000, 27_990_000, 3, 2022, false, 38,
                s("Màn hình", "6.1\" ProMotion 120Hz", "Chip", "A16 Bionic", "Camera", "48MP + 12MP + 12MP"),
                List.of("Màn hình luôn bật", "Dynamic Island"), "iphone"),
            p("dien-thoai", "Apple", "iPhone 13", "128GB - Xanh", FAIR, 84, 8_490_000, 18_990_000, 6, 2021, false, 88,
                s("Màn hình", "6.1\" OLED", "Chip", "A15 Bionic", "Camera", "12MP + 12MP"),
                List.of("Giá tốt nhất để lên iOS", "Pin bền cả ngày"), "iphone", "sinh vien"),
            p("dien-thoai", "Samsung", "Galaxy S25 Ultra", "256GB - Đen Titan", LIKE_NEW, null, 23_990_000, 33_990_000, 2, 2025, true, 19,
                s("Màn hình", "6.9\" Dynamic AMOLED 2X 120Hz", "Chip", "Snapdragon 8 Elite for Galaxy", "RAM", "12GB", "Camera", "200MP + 50MP + 50MP + 10MP"),
                List.of("Bút S Pen tích hợp", "Galaxy AI", "Camera 200MP"), "samsung", "flagship"),
            p("dien-thoai", "Samsung", "Galaxy S24", "256GB - Tím", EXCELLENT, null, 11_990_000, 22_990_000, 3, 2024, false, 27,
                s("Màn hình", "6.2\" Dynamic AMOLED 2X", "Chip", "Exynos 2400", "RAM", "8GB"),
                List.of("Nhỏ gọn", "Galaxy AI"), "samsung"),
            p("dien-thoai", "Samsung", "Galaxy Z Flip6", "256GB - Xanh Mint", GOOD, null, 12_490_000, 26_990_000, 2, 2024, false, 15,
                s("Màn hình", "6.7\" gập + 3.4\" phụ", "Chip", "Snapdragon 8 Gen 3", "RAM", "12GB"),
                List.of("Gập vỏ sò thời trang", "FlexCam"), "samsung", "gap"),
            p("dien-thoai", "Xiaomi", "Xiaomi 15", "512GB - Đen", LIKE_NEW, null, 15_990_000, 22_990_000, 3, 2025, true, 12,
                s("Màn hình", "6.36\" AMOLED 120Hz", "Chip", "Snapdragon 8 Elite", "RAM", "12GB", "Camera", "Leica 50MP x3"),
                List.of("Ống kính Leica", "Sạc nhanh 90W"), "xiaomi", "leica"),
            p("dien-thoai", "Xiaomi", "Xiaomi 14T Pro", "256GB - Xám", EXCELLENT, null, 9_990_000, 16_990_000, 4, 2024, false, 21,
                s("Màn hình", "6.67\" AMOLED 144Hz", "Chip", "Dimensity 9300+", "RAM", "12GB"),
                List.of("Sạc 120W đầy trong 19 phút", "Camera Leica"), "xiaomi"),
            p("dien-thoai", "Xiaomi", "Redmi Note 14 Pro", "256GB - Tím", GOOD, null, 5_290_000, 8_490_000, 7, 2025, false, 34,
                s("Màn hình", "6.67\" AMOLED 120Hz", "Chip", "Helio G100 Ultra", "RAM", "8GB", "Camera", "200MP"),
                List.of("Camera 200MP giá rẻ", "Kháng nước IP68"), "xiaomi", "sinh vien", "gia re"),

            // ---------- Laptop ----------
            p("laptop", "Apple", "MacBook Air M3 13 inch", "8GB / 256GB - Midnight", LIKE_NEW, 97, 19_990_000, 27_990_000, 3, 2024, true, 29,
                s("Chip", "Apple M3 8 nhân CPU, 10 nhân GPU", "RAM", "8GB", "SSD", "256GB", "Màn hình", "13.6\" Liquid Retina", "Pin", "~18 giờ"),
                List.of("Mỏng 1.13cm, nặng 1.24kg", "Không quạt, êm tuyệt đối"), "macbook", "sinh vien"),
            p("laptop", "Apple", "MacBook Air M2 13 inch", "8GB / 256GB - Starlight", EXCELLENT, 91, 15_490_000, 26_990_000, 4, 2022, false, 46,
                s("Chip", "Apple M2", "RAM", "8GB", "SSD", "256GB", "Màn hình", "13.6\" Liquid Retina"),
                List.of("Thiết kế mới vuông vức", "Sạc MagSafe"), "macbook", "sinh vien"),
            p("laptop", "Apple", "MacBook Pro 14 M3 Pro", "18GB / 512GB - Space Black", EXCELLENT, 93, 36_990_000, 49_990_000, 2, 2023, true, 11,
                s("Chip", "M3 Pro 11 nhân CPU, 14 nhân GPU", "RAM", "18GB", "SSD", "512GB", "Màn hình", "14.2\" Liquid Retina XDR 120Hz"),
                List.of("Màn hình XDR 1600 nits", "Pin 18 giờ", "Đủ cổng HDMI, SD"), "macbook", "do hoa"),
            p("laptop", "Apple", "MacBook Pro 16 M1 Pro", "16GB / 512GB - Bạc", GOOD, 85, 29_490_000, 64_990_000, 1, 2021, false, 9,
                s("Chip", "M1 Pro", "RAM", "16GB", "SSD", "512GB", "Màn hình", "16.2\" XDR 120Hz"),
                List.of("Màn hình lớn cho dựng phim", "Loa 6 củ cực hay"), "macbook", "do hoa"),
            p("laptop", "Samsung", "Galaxy Book4 Pro 14", "Core Ultra 7 / 16GB / 512GB", EXCELLENT, 92, 22_490_000, 35_990_000, 2, 2024, false, 6,
                s("CPU", "Intel Core Ultra 7 155H", "RAM", "16GB LPDDR5X", "SSD", "512GB", "Màn hình", "14\" Dynamic AMOLED 2X 3K 120Hz"),
                List.of("Màn AMOLED cảm ứng", "Hệ sinh thái Galaxy"), "samsung", "windows"),
            p("laptop", "Xiaomi", "Xiaomi Book Pro 14", "Core i7 / 16GB / 512GB", GOOD, 88, 13_990_000, 24_990_000, 2, 2022, false, 8,
                s("CPU", "Intel Core i7-1260P", "RAM", "16GB", "SSD", "512GB", "Màn hình", "14\" OLED 2.8K 90Hz"),
                List.of("Màn OLED 2.8K", "Vỏ nhôm nguyên khối"), "xiaomi", "windows"),

            // ---------- May anh ----------
            p("may-anh", "Sony", "Sony A7 IV", "Body - 8.200 shot", LIKE_NEW, null, 41_990_000, 59_990_000, 2, 2021, true, 14,
                s("Cảm biến", "Full-frame 33MP", "Video", "4K 60p 10-bit", "Lấy nét", "Real-time Eye AF", "Shutter count", "8.200"),
                List.of("Hybrid chụp & quay hoàn hảo", "Chống rung 5.5 stop"), "sony", "full frame"),
            p("may-anh", "Sony", "Sony ZV-E10", "Kit 16-50mm - 3.100 shot", EXCELLENT, null, 11_490_000, 18_990_000, 3, 2021, false, 31,
                s("Cảm biến", "APS-C 24.2MP", "Video", "4K 30p", "Màn hình", "Xoay lật", "Shutter count", "3.100"),
                List.of("Máy vlog quốc dân", "Mic định hướng 3 viên nang"), "sony", "vlog", "sinh vien"),
            p("may-anh", "Sony", "Sony A6400", "Body - 12.500 shot", GOOD, null, 13_990_000, 22_990_000, 2, 2019, false, 18,
                s("Cảm biến", "APS-C 24.2MP", "Lấy nét", "0.02s, 425 điểm", "Shutter count", "12.500"),
                List.of("Lấy nét nhanh nhất phân khúc", "Nhỏ gọn đi du lịch"), "sony"),
            p("may-anh", "Canon", "Canon EOS R6 Mark II", "Body - 5.600 shot", LIKE_NEW, null, 46_990_000, 62_990_000, 1, 2022, true, 7,
                s("Cảm biến", "Full-frame 24.2MP", "Tốc độ", "40 fps", "Video", "6K RAW out / 4K 60p", "Shutter count", "5.600"),
                List.of("Chống rung 8 stop", "Chụp thể thao, sự kiện"), "canon", "full frame"),
            p("may-anh", "Canon", "Canon EOS R50", "Kit 18-45mm - 2.300 shot", EXCELLENT, null, 14_490_000, 20_990_000, 3, 2023, false, 22,
                s("Cảm biến", "APS-C 24.2MP", "Video", "4K 30p không crop", "Trọng lượng", "375g", "Shutter count", "2.300"),
                List.of("Nhẹ nhất dòng R", "Màu da Canon đẹp"), "canon", "sinh vien"),
            p("may-anh", "Canon", "Canon EOS 6D Mark II", "Body - 21.000 shot", FAIR, null, 15_990_000, 37_990_000, 1, 2017, false, 10,
                s("Cảm biến", "Full-frame 26.2MP", "Kính ngắm", "Quang học", "Shutter count", "21.000"),
                List.of("Full-frame DSLR giá rẻ", "Pin 1200 shot/lần sạc"), "canon", "full frame"),

            // ---------- Tai nghe ----------
            p("tai-nghe", "Apple", "AirPods Pro 2 USB-C", "Hộp sạc MagSafe", LIKE_NEW, 100, 4_490_000, 6_190_000, 6, 2023, true, 95,
                s("Chống ồn", "ANC thế hệ 2", "Chip", "H2", "Pin", "6h (30h kèm hộp)", "Kháng nước", "IP54"),
                List.of("Chống ồn gấp 2 lần", "Chế độ Thích ứng"), "airpods"),
            p("tai-nghe", "Apple", "AirPods 4 ANC", "Có chống ồn", EXCELLENT, 100, 3_290_000, 4_990_000, 4, 2024, false, 37,
                s("Chống ồn", "ANC", "Chip", "H2", "Pin", "5h (30h kèm hộp)"),
                List.of("Dáng open-ear có chống ồn"), "airpods"),
            p("tai-nghe", "Sony", "Sony WH-1000XM5", "Đen", EXCELLENT, null, 5_490_000, 8_990_000, 3, 2022, true, 44,
                s("Chống ồn", "8 micro, chip QN1 + V1", "Pin", "30 giờ", "Codec", "LDAC, AAC, SBC"),
                List.of("Chống ồn top đầu", "Đeo nhẹ 250g"), "sony", "chup tai"),
            p("tai-nghe", "Sony", "Sony WF-1000XM5", "Bạc", GOOD, null, 3_690_000, 6_490_000, 2, 2023, false, 16,
                s("Chống ồn", "Processor V2 + QN2e", "Pin", "8h (24h kèm hộp)", "Codec", "LDAC"),
                List.of("True wireless chống ồn tốt nhất của Sony"), "sony"),
            p("tai-nghe", "Samsung", "Galaxy Buds3 Pro", "Bạc", LIKE_NEW, null, 3_190_000, 5_490_000, 4, 2024, false, 13,
                s("Chống ồn", "ANC thích ứng", "Pin", "6h (26h kèm hộp)", "Codec", "SSC UHQ 24bit"),
                List.of("Thiết kế thanh Blade Light", "Phiên dịch trực tiếp"), "samsung"),
            p("tai-nghe", "Xiaomi", "Xiaomi Buds 5 Pro", "Xám", EXCELLENT, null, 2_390_000, 4_290_000, 3, 2025, false, 9,
                s("Chống ồn", "55dB", "Pin", "10h (40h kèm hộp)", "Codec", "LDAC, aptX Lossless"),
                List.of("Âm thanh Harman tinh chỉnh"), "xiaomi"),

            // ---------- Dong ho ----------
            p("dong-ho", "Apple", "Apple Watch Ultra 2", "49mm Titan - Dây Alpine", EXCELLENT, 94, 14_990_000, 21_990_000, 2, 2023, true, 18,
                s("Màn hình", "49mm, 3000 nits", "Pin", "36 giờ (72h tiết kiệm)", "Chống nước", "100m, lặn 40m", "GPS", "Tần số kép"),
                List.of("Vỏ titan siêu bền", "Cho chạy bộ, leo núi, lặn"), "apple watch"),
            p("dong-ho", "Apple", "Apple Watch Series 10", "46mm Nhôm - Đen", LIKE_NEW, 99, 8_490_000, 11_990_000, 3, 2024, false, 26,
                s("Màn hình", "46mm OLED góc rộng", "Pin", "18 giờ", "Cảm biến", "ECG, SpO2, nhiệt độ"),
                List.of("Mỏng nhất từ trước tới nay", "Phát hiện ngưng thở khi ngủ"), "apple watch"),
            p("dong-ho", "Apple", "Apple Watch SE 2", "44mm - Bạc", GOOD, 88, 3_490_000, 7_490_000, 5, 2022, false, 48,
                s("Màn hình", "44mm Retina", "Pin", "18 giờ", "Cảm biến", "Nhịp tim, phát hiện té ngã"),
                List.of("Apple Watch giá rẻ nhất"), "apple watch", "sinh vien"),
            p("dong-ho", "Samsung", "Galaxy Watch7", "44mm - Xanh", EXCELLENT, null, 4_290_000, 7_990_000, 3, 2024, false, 14,
                s("Màn hình", "1.5\" Super AMOLED", "Pin", "40 giờ", "Cảm biến", "BioActive, đo mỡ cơ thể"),
                List.of("Galaxy AI cho sức khỏe"), "samsung"),
            p("dong-ho", "Xiaomi", "Xiaomi Watch S4", "47mm - Đen", LIKE_NEW, null, 2_590_000, 3_990_000, 4, 2025, false, 11,
                s("Màn hình", "1.43\" AMOLED", "Pin", "15 ngày", "Tính năng", "GPS, eSIM (bản eSIM)"),
                List.of("Pin 15 ngày", "Viền xoay thay được"), "xiaomi", "gia re"),

            // ---------- Phu kien (san pham 2.000d de test thanh toan that) ----------
            Product.builder().name("Khăn lau Microfiber ReTech").variant("30x30cm - Xám").category("phu-kien").brand("ReTech")
                .model("Khăn lau Microfiber").condition(LIKE_NEW).price(2_000).originalPrice(15_000).stock(999)
                .releaseYear(2026).warrantyMonths(0).featured(false).freeShipping(true).soldCount(0)
                .specs(new LinkedHashMap<>(s("Chất liệu", "Microfiber siêu mịn", "Kích thước", "30 x 30 cm", "Dùng cho", "Màn hình, ống kính, thân máy")))
                .highlights(new ArrayList<>(List.of("Không trầy màn hình", "Giặt lại được")))
                .tags(new ArrayList<>(List.of("khan lau", "phu kien", "test")))
                .description("Khăn lau màn hình và ống kính. Sản phẩm 2.000đ dùng để test thanh toán PayOS thật.").build());

        for (Product p : list) {
            p.setSlug(com.retech.util.TextUtil.slugify(p.getName() + " " + p.getVariant()));
            productService.save(p);
        }
    }

    private void seedBanners() {
        bannerRepo.saveAll(List.of(
                Banner.builder().title("iPhone 16 Pro Max.").subtitle("Titan. Như mới 99%. Rẻ hơn 7 triệu.")
                        .ctaText("Mua ngay").link("/san-pham/iphone-16-pro-max-256gb-titan-sa-mac").theme("dark").sortOrder(1).build(),
                Banner.builder().title("Bán máy cũ? AI định giá trong 10 giây.").subtitle("Thu cũ đổi mới – trợ giá đến 2 triệu.")
                        .ctaText("Định giá ngay").link("/thu-cu").theme("light").sortOrder(2).build(),
                Banner.builder().title("MacBook cho sinh viên.").subtitle("MacBook Air M2 chỉ từ 15,49 triệu. Nhập mã SINHVIEN giảm thêm 5%.")
                        .ctaText("Xem MacBook").link("/danh-muc/laptop?brand=Apple").theme("light").sortOrder(3).build()));
    }

    private void seedMenus() {
        int i = 0;
        List<MenuItem> items = new ArrayList<>();
        for (String[] m : new String[][]{{"Điện thoại", "/danh-muc/dien-thoai"}, {"Laptop", "/danh-muc/laptop"},
                {"Máy ảnh", "/danh-muc/may-anh"}, {"Tai nghe", "/danh-muc/tai-nghe"}, {"Đồng hồ", "/danh-muc/dong-ho"},
                {"Thu cũ", "/thu-cu"}})
            items.add(MenuItem.builder().label(m[0]).href(m[1]).position("HEADER").sortOrder(++i).build());
        for (String[] m : new String[][]{{"Sản phẩm", "Tất cả sản phẩm", "/san-pham"}, {"Sản phẩm", "Thu cũ đổi mới", "/thu-cu"},
                {"Hỗ trợ", "Câu hỏi thường gặp", "/hoi-dap"}, {"Hỗ trợ", "Liên hệ", "/lien-he"},
                {"Hỗ trợ", "Hình thức thanh toán", "/thanh-toan"}, {"Về ReTech", "Chatbot tư vấn", "/tro-ly-ai"}})
            items.add(MenuItem.builder().groupName(m[0]).label(m[1]).href(m[2]).position("FOOTER").sortOrder(++i).build());
        menuRepo.saveAll(items);
    }

    private void seedPromotions() {
        Instant now = Instant.now();
        promotionRepo.saveAll(List.of(
                Promotion.builder().code("RETECH10").name("Giảm 10% đơn đầu tiên").description("Tối đa 500.000đ cho đơn từ 3 triệu")
                        .type(Promotion.Type.PERCENT).value(10).maxDiscount(500_000).minOrderValue(3_000_000)
                        .startAt(now.minus(10, ChronoUnit.DAYS)).endAt(now.plus(60, ChronoUnit.DAYS)).usageLimit(500).build(),
                Promotion.builder().code("SINHVIEN").name("Ưu đãi sinh viên 5%").description("Giảm 5%, tối đa 1 triệu")
                        .type(Promotion.Type.PERCENT).value(5).maxDiscount(1_000_000).minOrderValue(5_000_000)
                        .startAt(now.minus(30, ChronoUnit.DAYS)).endAt(now.plus(120, ChronoUnit.DAYS)).build(),
                Promotion.builder().code("FREESHIP").name("Giảm 50.000đ").description("Cho mọi đơn từ 1 triệu")
                        .type(Promotion.Type.FIXED).value(50_000).minOrderValue(1_000_000)
                        .startAt(now.minus(5, ChronoUnit.DAYS)).endAt(now.plus(30, ChronoUnit.DAYS)).usageLimit(200).build()));
    }

    private void seedFaqs() {
        String[][] f = {
                {"Bảo hành", "Máy cũ ở ReTech được bảo hành bao lâu?", "Điện thoại, laptop, tai nghe, đồng hồ được bảo hành 12 tháng; máy ảnh 6 tháng. 30 ngày đầu lỗi phần cứng được 1 đổi 1."},
                {"Chất lượng", "Máy được kiểm tra như thế nào?", "Mỗi máy qua quy trình kiểm định 30 bước: màn hình, pin, camera, loa, mic, cảm biến, Face ID/vân tay, iCloud/khóa tài khoản... và được vệ sinh, dán nhãn tình trạng rõ ràng."},
                {"Thanh toán", "Có những hình thức thanh toán nào?", "Bạn có thể chuyển khoản qua mã QR (PayOS – hỗ trợ mọi ngân hàng, xác nhận tự động) hoặc thanh toán khi nhận hàng (COD)."},
                {"Giao hàng", "Phí giao hàng bao nhiêu?", "Phí giao toàn quốc 30.000đ, miễn phí cho đơn từ 2 triệu. Nội thành Hà Nội giao trong 2 giờ."},
                {"Thu cũ", "Bán máy cũ cho ReTech như thế nào?", "Vào trang Thu cũ, nhập thông tin máy để AI định giá ngay. Gửi yêu cầu, nhân viên sẽ liên hệ kiểm tra máy và thanh toán tiền mặt hoặc chuyển khoản trong ngày."},
                {"Đổi trả", "Tôi có được đổi trả nếu không ưng?", "Bạn được đổi trả trong 7 ngày nếu máy còn nguyên hiện trạng, phí đổi trả 5% giá trị máy (miễn phí nếu lỗi do cửa hàng)."},
                {"Trả góp", "Có hỗ trợ trả góp không?", "Hiện ReTech hỗ trợ trả góp 0% qua thẻ tín dụng tại cửa hàng cho đơn từ 5 triệu. Trả góp online sẽ sớm ra mắt."}};
        for (int i = 0; i < f.length; i++)
            faqRepo.save(Faq.builder().topic(f[i][0]).question(f[i][1]).answer(f[i][2]).sortOrder(i + 1).build());
    }

    /** Tao khach hang va don hang mau trong 30 ngay qua de trang thong ke co du lieu */
    private void seedOrders() {
        Random rnd = new Random(42);
        String[] names = {"Nguyễn Minh Anh", "Trần Quốc Bảo", "Lê Thu Hà", "Phạm Đức Long", "Vũ Thảo Vy", "Đỗ Hoàng Nam"};
        List<User> customers = new ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            User u = userRepo.save(User.builder().fullName(names[i]).email("khach" + (i + 1) + "@retech.vn")
                    .phone("09" + (10000000 + rnd.nextInt(89999999))).address("Hà Nội")
                    .passwordHash(encoder.encode("123456")).build());
            u.setCreatedAt(Instant.now().minus(rnd.nextInt(60), ChronoUnit.DAYS));
            customers.add(userRepo.save(u));
        }
        List<Product> products = productRepo.findAll();
        OrderStatus[] statuses = {OrderStatus.COMPLETED, OrderStatus.COMPLETED, OrderStatus.COMPLETED, OrderStatus.SHIPPING,
                OrderStatus.CONFIRMED, OrderStatus.PENDING, OrderStatus.CANCELLED};
        long baseCode = 25100100L;
        for (int i = 0; i < 36; i++) {
            User c = customers.get(rnd.nextInt(customers.size()));
            Product p = products.get(rnd.nextInt(products.size()));
            int qty = rnd.nextInt(10) < 8 ? 1 : 2;
            OrderStatus st = statuses[rnd.nextInt(statuses.length)];
            PaymentMethod pm = rnd.nextBoolean() ? PaymentMethod.PAYOS : PaymentMethod.COD;
            PaymentStatus ps = st == OrderStatus.CANCELLED ? PaymentStatus.CANCELLED
                    : (pm == PaymentMethod.PAYOS && st != OrderStatus.PENDING) || st == OrderStatus.COMPLETED ? PaymentStatus.PAID : PaymentStatus.UNPAID;
            long sub = p.getPrice() * qty;
            long ship = sub >= 2_000_000 ? 0 : 30_000;
            Order o = Order.builder().orderCode(baseCode + i).userId(c.getId())
                    .items(List.of(Order.Item.builder().productId(p.getId()).name(p.getName()).slug(p.getSlug())
                            .category(p.getCategory()).brand(p.getBrand()).condition(p.getCondition().label)
                            .price(p.getPrice()).quantity(qty).build()))
                    .subtotal(sub).shippingFee(ship).total(sub + ship)
                    .shipping(new Order.Shipping(c.getFullName(), c.getPhone(), c.getEmail(), "Cầu Giấy, Hà Nội", null))
                    .paymentMethod(pm).paymentStatus(ps).status(st).build();
            o.getHistory().add(new Order.StatusLog(st.name(), "Dữ liệu mẫu", Instant.now()));
            o = orderRepo.save(o);
            o.setCreatedAt(Instant.now().minus(rnd.nextInt(30), ChronoUnit.DAYS).minus(rnd.nextInt(12), ChronoUnit.HOURS));
            orderRepo.save(o);
        }

        tradeInRepo.save(TradeIn.builder().category("dien-thoai").brand("Apple").model("iPhone 14 Pro Max").storage("256GB")
                .purchaseYear(2022).condition(GOOD).batteryHealth(84).accessories(List.of("Hộp", "Sạc"))
                .contactName("Nguyễn Văn Khánh").contactPhone("0987654321")
                .aiEstimate(AiPriceSuggestion.builder().suggestedPrice(15_600_000).minPrice(14_500_000).maxPrice(16_700_000)
                        .buyPriceLow(10_600_000).buyPriceHigh(11_700_000).confidence(0.75).source("FORMULA")
                        .explanation("Dữ liệu mẫu").createdAt(Instant.now()).build()).build());
    }
}
