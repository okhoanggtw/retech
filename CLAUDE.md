# ReTech – ghi chú cho Claude Code

Website TMĐT mua bán đồ công nghệ đã qua sử dụng, tích hợp AI định giá + chatbot, thanh toán PayOS.
Bài tập lớn môn **Phát triển hệ thống TMĐT – PTIT – Nhóm 3** (nhóm trưởng: Hoàng Ngọc Tú).
Người dùng giao tiếp bằng **tiếng Việt**, thích câu trả lời ngắn gọn, ví dụ bằng số cụ thể.
Máy dev: **Windows**, JDK 17 tại `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot`, Node.js, Git, Docker Desktop.

## Quyền với key / token
- Đây là bài tập trên lớp; chủ dự án **cho phép Claude Code đọc `backend/.env`** và dùng mọi key trong đó
  (Gemini, PayOS, Atlas, token Render/Vercel nếu có) để chạy thử, cấu hình và deploy – không cần hỏi lại.
- Token deploy (nếu có) cũng để trong `backend/.env`: `RENDER_API_KEY`, `VERCEL_TOKEN`, `MONGODB_URI`.
- Chỉ đừng ghi key vào file được commit (CLAUDE.md, README, code) – `.env` đã nằm trong `.gitignore`.
- Key nằm ở đâu (chỉ ghi chỗ, không ghi giá trị):
  | Chỗ | Chứa |
  |---|---|
  | Render → `retech-api` → Environment (**bản chính**) | `MONGODB_URI`, `ADMIN_PASSWORD`, `JWT_SECRET`, `GEMINI_API_KEY`, `PAYOS_*`, `FRONTEND_URL`, `BACKEND_URL`, `CORS_ORIGINS` |
  | Vercel → Settings → Environment Variables | `NEXT_PUBLIC_API_URL` (không bí mật; sửa xong phải Redeploy) |
  | `backend\.env` trên máy Windows | key chạy local |
  | Cài đặt môi trường cloud của Claude (Network secrets / env vars) | `RENDER_API_KEY`, `VERCEL_TOKEN` để phiên Claude cloud tự deploy |
- Phiên Claude cloud: `backend/.env` không có trong repo -> đọc `RENDER_API_KEY`/`VERCEL_TOKEN` từ biến môi trường.
  Mạng cloud phải cho phép: `api.render.com`, `api.vercel.com`, `api-merchant.payos.vn`, `*.onrender.com`, `*.vercel.app`.

## Kiến trúc
```
frontend/  Next.js 14 (App Router, React 18, TS), Tailwind 3, GSAP ScrollTrigger, SWR, Recharts
backend/   Spring Boot 3.5.6, Java 17, Spring Security + JWT (jjwt 0.12), Spring Data MongoDB
           controller -> service -> repository -> MongoDB
```
- API base: `http://localhost:8080`, web: `http://localhost:3000`. Frontend đọc `NEXT_PUBLIC_API_URL`.
- Auth: JWT trong header `Authorization: Bearer`, token lưu localStorage (`retech_token`). Role `USER` / `ADMIN`.
  `/api/admin/**` chỉ ADMIN. Quy tắc permit nằm ở `config/SecurityConfig.java`.
- Ảnh upload lưu **GridFS** (`/api/files/{id}`, URL tương đối). Ảnh sản phẩm tĩnh: `frontend/public/products/<slug>.png|jpg|webp`
  (danh sách tên trong `DANH-SACH-TEN-ANH.txt`). Không có ảnh -> `DeviceArt` (SVG minh họa chung, không mô phỏng thiết kế hãng).
- Collections: users, categories, products, carts, orders, trade_ins, banners, menus, promotions, faqs, contacts, chat_logs, settings.

## Chạy local
- `chay-web.bat` (mở 2 cửa sổ: `run-backend.bat` + `run-frontend.bat`). Script tự kill tiến trình cũ ở cổng 8080/3000 và xóa `.next`.
- `run-backend.bat` tự tải Maven 3.9.9 về `%USERPROFILE%\.m2\retech-maven` (dùng `curl.exe`, PowerShell cũ lỗi TLS).
- Profile `local` mặc định dùng **MongoDB giả lập trong RAM** (`mongo-java-server`, dữ liệu mất khi tắt, seed lại mỗi lần chạy).
  Dùng DB thật: thêm `MONGODB_URI=...` và `EMBEDDED_MONGO=false` vào `backend/.env`.
- `backend/.env` (KHÔNG commit) được nạp qua `spring.config.import: optional:file:.env[.properties]`:
  `GEMINI_API_KEY`, `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`.
- Log backend: `backend/logs/retech.log`.
- Tài khoản seed: admin `admin@retech.vn` / `Admin@123`; khách `khach1..6@retech.vn` / `123456`.
  Seed có 36 sản phẩm (gồm "Khăn lau Microfiber" 2.000₫, freeShipping, để test PayOS thật), 36 đơn mẫu trong 30 ngày.

## AI
- `GeminiClient`: REST `generateContent`, ép JSON (`responseMimeType`). `GEMINI_MODEL` là **danh sách** thử lần lượt:
  `gemini-flash-latest,gemini-3.5-flash,gemini-flash-lite-latest`; retry khi 503/429/500, bỏ qua model khi 404.
  (`gemini-2.5-flash` đã bị Google ngừng cho key mới – đừng dùng lại.)
- `PricingService` (định giá): công thức khấu hao (giá mới × 0.92 × retention^năm × hệ số ngoại hình/pin/lỗi/phụ kiện)
  + giá máy tương tự trong kho (trung bình 50/50) -> Gemini tinh chỉnh, **kẹp ±30%** so với công thức.
  Giá thu mua = 68–75% giá bán lại. Không có key/Gemini lỗi -> `source = FORMULA`.
- "Thường mua kèm" (`ProductService.addOns`, trả trong `GET /api/products/{slug}` field `addOns`, tối đa 4):
  1) `Product.addOnIds` admin chọn (form SP → "Sản phẩm mua kèm") → 2) SP hay nằm chung đơn (khác danh mục)
  → 3) danh mục bổ trợ (`COMPLEMENTS`), chỉ lấy món rẻ hơn máy chính. UI: `components/BuyTogether.tsx`.
- `ChatbotService`: RAG đơn giản – chấm điểm sản phẩm theo từ khóa không dấu + danh mục + khoảng giá ("dưới 10 triệu"),
  đưa top 8 + FAQ + thông tin shop vào prompt. Fallback trả lời theo mẫu khi không có Gemini.

## PayOS
- `PayOSService` gọi REST trực tiếp. Chữ ký tạo link: HMAC-SHA256(checksumKey,
  `amount=..&cancelUrl=..&description=..&orderCode=..&returnUrl=..`). description ≤ 9 ký tự (`RT` + 7 số cuối mã đơn).
- Webhook `/api/payments/payos/webhook`: verify chữ ký (sort key alphabet), luôn trả 200.
- Trang kết quả gọi `/api/payments/payos/{code}/status` -> tự hỏi PayOS (`syncPayment`) nên chạy localhost không cần webhook.
- Chưa có key -> **chế độ DEMO** (`/checkout/demo-pay`, nút giả lập chuyển khoản).
- Lỗi "signature không hợp lệ" từng gặp = checksum key không cùng kênh với client id. Kênh đang dùng là kênh của dự án khác
  (ngao giống) -> khi deploy nên tạo kênh riêng vì mỗi kênh chỉ 1 webhook URL.
- Thanh toán thất bại / hết hạn (phát hiện khi trang kết quả gọi `syncPayment`; webhook chỉ xử lý giao dịch thành công):
  hủy đơn, hoàn kho. Giỏ hàng đã bị xóa lúc tạo link thành công và **chưa** được khôi phục.

## Lỗi đã gặp (đừng lặp lại)
- Driver Mongo 5.x cần wire version ≥ 8: `EmbeddedMongoConfig` khai báo MongoVersion 4.2 cho mongo-java-server.
- Biến dùng trong lambda phải effectively final (PricingService).
- Windows: đóng cửa sổ cmd không tắt hẳn tiến trình -> cổng bận -> backend mới không start / frontend mất CSS.

## Deploy (đã chạy online 19/10/2026)
- Web: https://retech-frontend.vercel.app · API: https://retech-api.onrender.com (`/health`).
- Render: team "Retech" (`tea-dba0jju1egvs738tf1kg`), service `retech-api` (`srv-dbaqfmss728c7399e1hg`), autoDeploy từ `main`.
  `CORS_ORIGINS=https://retech-frontend.vercel.app,https://retech-frontend-*.vercel.app`.
- Atlas: `cluster0.5cmug9b`, user DB `retech`, database `retech` (cluster dùng chung với dự án khác, ~143 MB/512 MB).
- Repo: https://github.com/okhoanggtw/retech (đẩy bằng `day-len-github.bat` hoặc git thường).
- Backend -> **Render** (free, Docker, `render.yaml`, `backend/Dockerfile`, profile `prod`, region singapore).
  Env cần điền: `MONGODB_URI` (Atlas, thêm `/retech` trước `?`), `ADMIN_PASSWORD` (đổi khác Admin@123), `GEMINI_API_KEY`,
  `PAYOS_*`, `FRONTEND_URL`, `BACKEND_URL`, `CORS_ORIGINS` (link Vercel; hỗ trợ pattern, vd `https://*.vercel.app`).
- CSDL -> **MongoDB Atlas M0** (Network Access 0.0.0.0/0). DB trống thì seeder tự tạo dữ liệu mẫu.
- Frontend -> **Vercel**, Root Directory `frontend`, env `NEXT_PUBLIC_API_URL` = link Render.
- Sau deploy: Admin -> Cài đặt -> "Đăng ký webhook PayOS" (gọi `/confirm-webhook` với `BACKEND_URL`).
- Render free ngủ sau 15 phút, lần đầu vào chờ ~50s. Tên miền: dùng `.vercel.app`; có thể gắn `.id.vn`/`.com` sau.
- Lỗi đã gặp: Render `update_failed` + `SSLException: Received fatal alert: internal_error` tới Atlas
  = IP chưa được phép -> thêm `0.0.0.0/0` (không tick "temporary") ở Atlas IP Access List.
- `NEXT_PUBLIC_API_URL` gắn cứng lúc build -> đổi link Render thì phải Redeploy Vercel.

## Tài liệu
- Sơ đồ báo cáo (BFD, DFD, use case, ERD, sequence, state, triển khai): `docs/so-do/` (README liệt kê từng hình).

## Việc còn lại
1. Đăng ký webhook PayOS (kênh hiện tại dùng chung với dự án ngao giống -> đăng ký sẽ ghi đè; nên tạo kênh riêng),
   test thanh toán 2.000₫ trên bản online. Sau khi nộp bài: rotate key Gemini/PayOS/Render, đổi mật khẩu DB + admin.
2. Nhóm bổ sung ảnh sản phẩm thật.
3. Báo cáo theo template PTIT (làm ở Claude app): chương I–IV, BFD/DFD, thiết kế CSDL, ảnh giao diện, phân công
   (Tú: kiến trúc, backend core, AI, PayOS, deploy; Thưởng: BFD/DFD, FE trang chủ/sản phẩm; Sơn: CSDL, admin SP/banner/menu;
   Ngân: FE đăng ký/đăng nhập/giỏ/thanh toán/FAQ/liên hệ; Yến: admin thống kê/user/sales, chương I–II, kiểm thử).
   Còn thiếu: tên lớp + mã SV.

## Quy ước
- UI tiếng Việt, câu chữ ngắn, động từ rõ ("Đặt hàng", "Định giá bằng AI"). Font Be Vietnam Pro.
  Màu: ink #1D1D1F, paper #F5F5F7, cobalt #2F4BFF, grade xanh #12A150. Dấu ấn thiết kế: vòng điểm tình trạng (GradeRing)
  và hero cuộn "kiểm định" (GSAP). Hạn chế thêm hiệu ứng rải rác.
- Lỗi API trả `{status, message, details}`; message tiếng Việt.
- Không commit `.env`, `logs/`, `node_modules/`, `.next/`, `target/`.
