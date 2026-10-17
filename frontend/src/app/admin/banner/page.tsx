"use client";
import CrudPage from "@/components/admin/CrudPage";
import { Badge } from "@/components/ui";
export default function Page() {
  return <CrudPage title="Banner trang chủ" endpoint="/api/admin/banners" addLabel="Thêm banner"
    defaults={{ title: "", subtitle: "", ctaText: "Xem ngay", link: "/san-pham", theme: "light", sortOrder: 1, active: true }}
    fields={[{ key: "title", label: "Tiêu đề", required: true }, { key: "subtitle", label: "Mô tả ngắn" }, { key: "ctaText", label: "Chữ trên nút" },
      { key: "link", label: "Liên kết", hint: "Ví dụ /san-pham/iphone-15 hoặc /thu-cu" }, { key: "image", label: "Ảnh (không bắt buộc)", type: "image" },
      { key: "theme", label: "Nền", type: "select", options: [["light", "Sáng"], ["dark", "Tối"]] }, { key: "sortOrder", label: "Thứ tự", type: "number" },
      { key: "active", label: "Đang hiển thị", type: "checkbox" }]}
    columns={[{ label: "Thứ tự", render: (r) => r.sortOrder as number }, { label: "Tiêu đề", render: (r) => <b>{r.title as string}</b> },
      { label: "Liên kết", render: (r) => r.link as string }, { label: "Trạng thái", render: (r) => r.active ? <Badge tone="bg-grade-soft text-grade">Hiển thị</Badge> : <Badge tone="bg-paper text-graphite">Ẩn</Badge> }]} />;
}
