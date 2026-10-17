"use client";
import CrudPage from "@/components/admin/CrudPage";
import { Badge } from "@/components/ui";
export default function Page() {
  return <CrudPage title="Menu" endpoint="/api/admin/menus" addLabel="Thêm mục menu"
    defaults={{ label: "", href: "/", position: "HEADER", groupName: "", sortOrder: 10, active: true }}
    fields={[{ key: "label", label: "Tên hiển thị", required: true }, { key: "href", label: "Đường dẫn", required: true },
      { key: "position", label: "Vị trí", type: "select", options: [["HEADER", "Thanh điều hướng trên"], ["FOOTER", "Chân trang"]] },
      { key: "groupName", label: "Nhóm (chân trang)", hint: "Các mục cùng nhóm hiển thị chung một cột" },
      { key: "sortOrder", label: "Thứ tự", type: "number" }, { key: "active", label: "Đang hiển thị", type: "checkbox" }]}
    columns={[{ label: "Thứ tự", render: (r) => r.sortOrder as number }, { label: "Tên", render: (r) => <b>{r.label as string}</b> },
      { label: "Đường dẫn", render: (r) => r.href as string }, { label: "Vị trí", render: (r) => r.position === "HEADER" ? "Trên" : `Chân trang · ${r.groupName ?? ""}` },
      { label: "", render: (r) => !r.active && <Badge tone="bg-paper text-graphite">Ẩn</Badge> }]} />;
}
