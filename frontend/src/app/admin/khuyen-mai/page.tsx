"use client";
import CrudPage from "@/components/admin/CrudPage";
import { Badge } from "@/components/ui";
import { date, vnd } from "@/lib/format";
export default function Page() {
  return <CrudPage title="Khuyến mãi (Sales)" endpoint="/api/admin/promotions" addLabel="Tạo mã giảm giá"
    defaults={{ code: "", name: "", description: "", type: "PERCENT", value: 10, maxDiscount: 0, minOrderValue: 0, usageLimit: 0, usedCount: 0, active: true, startAt: new Date().toISOString() }}
    fields={[{ key: "code", label: "Mã", required: true, hint: "Viết hoa không dấu, ví dụ TET2027" }, { key: "name", label: "Tên chương trình", required: true },
      { key: "description", label: "Mô tả" }, { key: "type", label: "Loại giảm", type: "select", options: [["PERCENT", "Theo %"], ["FIXED", "Số tiền cố định"]] },
      { key: "value", label: "Giá trị (% hoặc ₫)", type: "number" }, { key: "maxDiscount", label: "Giảm tối đa (₫, 0 = không giới hạn)", type: "number" },
      { key: "minOrderValue", label: "Đơn tối thiểu (₫)", type: "number" }, { key: "usageLimit", label: "Số lượt dùng (0 = không giới hạn)", type: "number" },
      { key: "startAt", label: "Bắt đầu", type: "datetime" }, { key: "endAt", label: "Kết thúc", type: "datetime" }, { key: "active", label: "Đang bật", type: "checkbox" }]}
    columns={[{ label: "Mã", render: (r) => <b className="text-cobalt">{r.code as string}</b> }, { label: "Tên", render: (r) => r.name as string },
      { label: "Giảm", render: (r) => r.type === "PERCENT" ? `${r.value}%` : vnd(r.value as number) },
      { label: "Đã dùng", render: (r) => `${r.usedCount}/${(r.usageLimit as number) || "∞"}` },
      { label: "Hạn", render: (r) => r.endAt ? date(r.endAt as string) : "—" },
      { label: "Trạng thái", render: (r) => r.active ? <Badge tone="bg-grade-soft text-grade">Bật</Badge> : <Badge tone="bg-paper text-graphite">Tắt</Badge> }]} />;
}
