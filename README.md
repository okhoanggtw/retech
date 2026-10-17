# ReTech – Website mua bán đồ công nghệ cũ tích hợp AI định giá

Đồ án môn Phát triển hệ thống TMĐT – PTIT – Nhóm 3.

| Phần | Công nghệ |
|---|---|
| Backend | Java 17, Spring Boot 3.5, Spring Security + JWT |
| CSDL | MongoDB (Atlas khi deploy; MongoDB giả lập trong RAM khi chạy thử) |
| Frontend | Next.js 14 (React 18, TypeScript), Tailwind CSS, GSAP ScrollTrigger |
| AI | Google Gemini – định giá máy cũ + chatbot tư vấn (RAG trên kho sản phẩm) |
| Thanh toán | PayOS (VietQR) – webhook xác nhận tự động |

## Chạy trên máy (Windows)
1. `backend\.env` – điền `GEMINI_API_KEY`, `PAYOS_*` (xem `.env.example`).
2. Nhấp đúp `run-backend.bat` → API tại http://localhost:8080
3. Nhấp đúp `run-frontend.bat` → web tại http://localhost:3000

Tài khoản mẫu: admin `admin@retech.vn` / `Admin@123` · khách `khach1@retech.vn` / `123456`.
Trang quản trị: http://localhost:3000/admin

## Cấu trúc
```
backend/   Spring Boot REST API (controller → service → repository → MongoDB)
frontend/  Next.js (src/app = các trang, src/components, src/lib)
```

## Deploy (miễn phí)
1. **MongoDB Atlas** – tạo cluster M0, user DB, Network Access `0.0.0.0/0`, lấy chuỗi `mongodb+srv://.../retech`.
2. **Render** – New → Blueprint → chọn repo này (đọc `render.yaml`). Điền biến môi trường:
   `MONGODB_URI`, `ADMIN_PASSWORD`, `GEMINI_API_KEY`, `PAYOS_*`, `FRONTEND_URL` (link Vercel),
   `BACKEND_URL` (link Render), `CORS_ORIGINS` (link Vercel).
3. **Vercel** – Import repo → Root Directory `frontend` → biến `NEXT_PUBLIC_API_URL` = link Render.
4. Vào Admin → Cài đặt → **Đăng ký webhook PayOS**.
