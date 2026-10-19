# Sơ đồ cho báo cáo ReTech

Ảnh PNG (200 dpi, đen trắng, in rõ) nằm trong `png/`. File nguồn `.puml` (PlantUML) và `.dot` (Graphviz) để sửa.
Xuất lại ảnh: `sh build.sh /duong/dan/plantuml.jar` (cần Graphviz + Java).

| Ảnh | Tên hình gợi ý | Đặt ở chương |
|---|---|---|
| `01-bfd.png` | Biểu đồ phân rã chức năng (BFD) | Phân tích – chức năng |
| `02-dfd-ngu-canh.png` | DFD mức ngữ cảnh | Phân tích – luồng dữ liệu |
| `03-dfd-muc-dinh.png` | DFD mức đỉnh (mức 0) | Phân tích – luồng dữ liệu |
| `04-dfd-ban-hang.png` | DFD mức dưới đỉnh: 3.0 Quản lý bán hàng | Phân tích – luồng dữ liệu |
| `05-dfd-thu-mua.png` | DFD mức dưới đỉnh: 4.0 Thu mua máy cũ | Phân tích – luồng dữ liệu |
| `06a-use-case-khach-hang.png` | Biểu đồ use case phía khách hàng | Phân tích – yêu cầu |
| `06b-use-case-quan-tri.png` | Biểu đồ use case phía quản trị | Phân tích – yêu cầu |
| `07-erd.png` | Thiết kế CSDL (MongoDB) | Thiết kế – CSDL |
| `08-sequence-dat-hang.png` | Biểu đồ tuần tự đặt hàng, thanh toán PayOS | Thiết kế – xử lý |
| `09-state-don-hang.png` | Biểu đồ trạng thái đơn hàng | Thiết kế – xử lý |
| `10-kien-truc-trien-khai.png` | Kiến trúc triển khai | Cài đặt, triển khai |

## Ghi chú để viết báo cáo
- **DFD** dùng ký hiệu DeMarco–Yourdon: hình tròn = tiến trình, chữ nhật = tác nhân ngoài, hai đường song song = kho dữ liệu.
  Tác nhân/kho được vẽ lặp lại ở nhiều hàng cho dễ đọc (đã ghi chú dưới hình).
- Số hiệu tiến trình DFD (1.0–6.0) khớp với nhánh 1–6 của BFD.
- Kho dữ liệu ↔ collection MongoDB: D1 `users` · D2 `products`, `categories` · D3 `carts` · D4 `orders` · D5 `promotions`
  · D6 `trade_ins` · D7 `contacts`, `chat_logs` · D8 `banners`, `menus`, `faqs`, `settings`.
- **CSDL** là MongoDB (NoSQL), không có khóa ngoại thật: "FK" là tham chiếu bằng id/slug do tầng Service kiểm soát;
  chi tiết đơn (`OrderItem`), địa chỉ giao, lịch sử trạng thái được **nhúng** trong bản ghi đơn hàng (lưu cả tên, giá lúc mua
  để đơn cũ không đổi khi sản phẩm bị sửa giá).
- Mọi sơ đồ vẽ theo code thật (controller, model, service) tại thời điểm 19/10/2026.
