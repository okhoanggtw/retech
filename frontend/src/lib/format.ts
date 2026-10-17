export const vnd = (n: number | undefined | null) =>
  (n ?? 0).toLocaleString("vi-VN") + "₫";

export const vndShort = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + " tr" : vnd(n);

export const dateTime = (s?: string) =>
  s ? new Date(s).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "";

export const date = (s?: string) => (s ? new Date(s).toLocaleDateString("vi-VN") : "");

export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Chờ xác nhận", tone: "bg-amber-soft text-amber" },
  CONFIRMED: { label: "Đã xác nhận", tone: "bg-cobalt-soft text-cobalt" },
  SHIPPING: { label: "Đang giao", tone: "bg-cobalt-soft text-cobalt" },
  COMPLETED: { label: "Hoàn thành", tone: "bg-grade-soft text-grade" },
  CANCELLED: { label: "Đã hủy", tone: "bg-danger-soft text-danger" },
};
export const PAYMENT_STATUS: Record<string, { label: string; tone: string }> = {
  UNPAID: { label: "Chưa thanh toán", tone: "bg-amber-soft text-amber" },
  PAID: { label: "Đã thanh toán", tone: "bg-grade-soft text-grade" },
  CANCELLED: { label: "Đã hủy", tone: "bg-danger-soft text-danger" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "bg-paper text-graphite" },
};
