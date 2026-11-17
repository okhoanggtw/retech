"use client";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowUp,
  ArrowDown,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Columns2,
  Maximize2,
  X,
  ExternalLink,
} from "lucide-react";
import { api, fetcher, imgUrl } from "@/lib/api";
import type { Banner } from "@/lib/types";
import { Badge, Field, Skeleton, Spinner } from "@/components/ui";
import { useToast } from "@/components/Toast";
import ImageUploader from "@/components/admin/ImageUploader";

export default function BannerAdminPage() {
  const { data: banners, mutate } = useSWR<Banner[]>("/api/admin/banners", fetcher);
  const [edit, setEdit] = useState<Partial<Banner> | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const toast = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setBusy(true);
    try {
      if (edit.id) {
        await api(`/api/admin/banners/${edit.id}`, { method: "PUT", json: edit });
        toast("Đã cập nhật banner", "success");
      } else {
        const nextOrder = (banners?.length || 0) + 1;
        await api("/api/admin/banners", { method: "POST", json: { ...edit, sortOrder: nextOrder } });
        toast("Đã thêm banner mới", "success");
      }
      setEdit(null);
      mutate();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!confirm(`Xác nhận xóa banner: "${b.title}"?`)) return;
    try {
      await api(`/api/admin/banners/${b.id}`, { method: "DELETE" });
      toast("Đã xóa banner", "success");
      mutate();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const handleToggleActive = async (b: Banner) => {
    try {
      await api(`/api/admin/banners/${b.id}`, { method: "PUT", json: { ...b, active: !b.active } });
      mutate();
      toast(b.active ? "Đã ẩn banner" : "Đã bật hiển thị banner", "success");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const handleSetColSpan = async (b: Banner, colSpan: number) => {
    try {
      await api(`/api/admin/banners/${b.id}`, { method: "PUT", json: { ...b, colSpan } });
      mutate();
      toast(`Đã đổi bố cục sang ${colSpan === 2 ? "Toàn màn hình (2 cột)" : colSpan === 1 ? "Nửa màn hình (1 cột)" : "Tự động"}`, "success");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  // Đưa banner lên vị trí đầu tiên (#1)
  const handleMoveToTop = async (index: number) => {
    if (!banners || index <= 0) return;
    const newList = [...banners];
    const [target] = newList.splice(index, 1);
    newList.unshift(target);
    await applyNewOrder(newList);
    toast(`Đã đưa "${target.title}" lên đầu tiên`, "success");
  };

  // Di chuyển lên 1 nấc
  const handleMoveUp = async (index: number) => {
    if (!banners || index <= 0) return;
    const newList = [...banners];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    await applyNewOrder(newList);
  };

  // Di chuyển xuống 1 nấc
  const handleMoveDown = async (index: number) => {
    if (!banners || index >= banners.length - 1) return;
    const newList = [...banners];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    await applyNewOrder(newList);
  };

  const applyNewOrder = async (newList: Banner[]) => {
    const ids = newList.map((b) => b.id).filter(Boolean) as string[];
    try {
      await api("/api/admin/banners/reorder", { method: "PUT", json: ids });
      mutate(newList, false);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header trang */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Giao diện & Banner</h1>
          <p className="mt-1 text-sm text-graphite">
            Tùy biến trực tiếp thứ tự hiển thị, đưa banner lên đầu, chia 1 cột / 2 cột toàn màn hình và xem trước giao diện.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((s) => !s)}
            className={`btn-ghost text-sm ${showPreview ? "text-cobalt font-semibold" : ""}`}
          >
            {showPreview ? "Ẩn xem trước" : "Hiện xem trước"}
          </button>
          <button
            onClick={() =>
              setEdit({
                title: "",
                subtitle: "",
                ctaText: "Xem ngay",
                link: "/san-pham",
                theme: "light",
                colSpan: 0,
                active: true,
              })
            }
            className="btn-primary"
          >
            <Plus size={18} /> Thêm banner mới
          </button>
        </div>
      </div>

      {/* Xem trước Bố cục Trang chủ (Live Visual Layout Preview) */}
      {showPreview && banners && banners.length > 0 && (
        <div className="rounded-xl2 border border-mist bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-mist pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-grade animate-pulse" />
              <h2 className="font-bold text-sm text-ink uppercase tracking-wider">
                Xem trước Bố cục Thực tế trên Trang chủ
              </h2>
            </div>
            <span className="text-xs text-graphite">Thứ tự và độ rộng hiển thị thực tế</span>
          </div>

          <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2">
            {banners.map((b, idx) => {
              const isFirst = idx === 0;
              const isBig = b.colSpan === 2 || (b.colSpan !== 1 && isFirst);
              const isDark = b.theme === "dark";
              return (
                <div
                  key={b.id || idx}
                  className={`relative flex flex-col items-center justify-between rounded-xl2 p-6 text-center border transition-all ${
                    isBig ? "md:col-span-2 min-h-[200px]" : "min-h-[170px]"
                  } ${isDark ? "bg-black text-white border-black" : "bg-paper text-ink border-mist"} ${
                    !b.active ? "opacity-40" : ""
                  }`}
                >
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <span className="rounded-md bg-cobalt px-2 py-0.5 text-xs font-bold text-white shadow">
                      #{idx + 1}
                    </span>
                    <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
                      {isBig ? "Toàn màn hình (2 cột)" : "Nửa màn hình (1 cột)"}
                    </span>
                    {!b.active && (
                      <span className="rounded-md bg-danger/80 px-2 py-0.5 text-[11px] font-bold text-white">
                        Đang ẩn
                      </span>
                    )}
                  </div>

                  <div className="mt-6 space-y-1">
                    <h3 className={`font-bold tracking-tight ${isBig ? "text-2xl md:text-3xl" : "text-xl"}`}>
                      {b.title}
                    </h3>
                    {b.subtitle && (
                      <p className={`text-sm max-w-lg ${isDark ? "text-white/70" : "text-graphite"}`}>
                        {b.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {b.ctaText && (
                      <span className="rounded-full bg-cobalt px-4 py-1 text-xs font-semibold text-white">
                        {b.ctaText}
                      </span>
                    )}
                    <span className="text-xs opacity-60">Liên kết: {b.link}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bảng danh sách & Công cụ điều khiển */}
      <div className="overflow-x-auto rounded-xl2 bg-white shadow-sm border border-mist/80">
        {!banners ? (
          <Skeleton className="h-60" />
        ) : (
          <table className="w-full min-w-[760px] text-sm text-left">
            <thead className="border-b border-mist bg-paper/50 text-xs font-semibold text-graphite uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-16">Thứ tự</th>
                <th className="px-4 py-3.5">Banner</th>
                <th className="px-4 py-3.5 w-48">Bố cục cột</th>
                <th className="px-4 py-3.5 w-32">Nền</th>
                <th className="px-4 py-3.5 w-28 text-center">Trạng thái</th>
                <th className="px-4 py-3.5 text-right w-44">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist/70">
              {banners.map((b, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === banners.length - 1;
                const isBig = b.colSpan === 2 || (b.colSpan !== 1 && isFirst);
                return (
                  <tr key={b.id} className={`hover:bg-paper/40 transition-colors ${!b.active ? "opacity-60" : ""}`}>
                    {/* Cột Thứ tự + Nút di chuyển */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-cobalt-soft font-bold text-cobalt text-xs">
                          #{idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveUp(idx)}
                            disabled={isFirst}
                            className="rounded p-0.5 hover:bg-mist disabled:opacity-20"
                            title="Di chuyển lên"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            onClick={() => handleMoveDown(idx)}
                            disabled={isLast}
                            className="rounded p-0.5 hover:bg-mist disabled:opacity-20"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Cột Tiêu đề & Nội dung */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-11 w-14 shrink-0 rounded-lg border grid place-items-center text-[10px] font-bold ${
                            b.theme === "dark" ? "bg-black text-white border-black" : "bg-paper text-ink border-mist"
                          }`}
                        >
                          {b.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgUrl(b.image)} alt="" className="h-full w-full object-contain rounded-lg" />
                          ) : (
                            b.theme === "dark" ? "Dark" : "Light"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink">{b.title}</span>
                            {isFirst && (
                              <span className="rounded bg-cobalt px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                                Banner Chính
                              </span>
                            )}
                          </div>
                          {b.subtitle && <p className="text-xs text-graphite line-clamp-1">{b.subtitle}</p>}
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-cobalt">
                            <span>Nút: "{b.ctaText || "Xem ngay"}"</span>
                            <span>·</span>
                            <span className="text-graphite line-clamp-1">Link: {b.link}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột Bố cục cột (ColSpan) */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="inline-flex rounded-lg border border-mist bg-paper p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleSetColSpan(b, 2)}
                          className={`flex items-center gap-1 rounded-md px-2 py-1 font-medium transition ${
                            isBig ? "bg-cobalt text-white shadow" : "text-graphite hover:text-ink"
                          }`}
                          title="Trải rộng 2 cột toàn màn hình"
                        >
                          <Columns2 size={13} /> 2 cột (Full)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetColSpan(b, 1)}
                          className={`flex items-center gap-1 rounded-md px-2 py-1 font-medium transition ${
                            !isBig ? "bg-cobalt text-white shadow" : "text-graphite hover:text-ink"
                          }`}
                          title="Thu gọn 1 cột nửa màn hình"
                        >
                          <Columns2 size={13} /> 1 cột
                        </button>
                      </div>
                    </td>

                    {/* Cột Nền */}
                    <td className="px-4 py-3.5 align-middle">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        b.theme === "dark" ? "bg-black text-white" : "bg-paper text-ink border border-mist"
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${b.theme === "dark" ? "bg-white" : "bg-amber-400"}`} />
                        {b.theme === "dark" ? "Nền tối (Đen)" : "Nền sáng (Trắng)"}
                      </span>
                    </td>

                    {/* Cột Trạng thái */}
                    <td className="px-4 py-3.5 align-middle text-center">
                      <button
                        onClick={() => handleToggleActive(b)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition ${
                          b.active ? "bg-grade-soft text-grade hover:bg-grade-soft/70" : "bg-mist/80 text-graphite hover:bg-mist"
                        }`}
                        title="Bấm để bật / tắt hiển thị"
                      >
                        {b.active ? <Eye size={13} /> : <EyeOff size={13} />}
                        {b.active ? "Hiển thị" : "Đang ẩn"}
                      </button>
                    </td>

                    {/* Cột Thao tác */}
                    <td className="px-4 py-3.5 text-right align-middle">
                      <div className="flex items-center justify-end gap-1">
                        {!isFirst && (
                          <button
                            onClick={() => handleMoveToTop(idx)}
                            className="inline-flex items-center gap-1 rounded-lg bg-cobalt-soft px-2.5 py-1 text-xs font-bold text-cobalt hover:bg-cobalt hover:text-white transition"
                            title="Đưa banner này lên vị trí đầu tiên (Banner chính)"
                          >
                            <Sparkles size={13} /> Lên đầu
                          </button>
                        )}
                        <button
                          onClick={() => setEdit(b)}
                          className="icon-btn text-graphite hover:text-ink"
                          title="Chỉnh sửa nội dung"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          className="icon-btn text-danger hover:bg-danger-soft"
                          title="Xóa banner"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Thêm / Chỉnh sửa Banner */}
      {edit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-xl rounded-xl2 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-mist pb-3">
              <h2 className="text-xl font-bold">
                {edit.id ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
              </h2>
              <button
                type="button"
                onClick={() => setEdit(null)}
                className="icon-btn"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <Field label="Tiêu đề banner">
              <input
                className="input"
                required
                value={edit.title || ""}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                placeholder="Ví dụ: iPhone 16 Pro Max."
              />
            </Field>

            <Field label="Mô tả phụ (Subtitle)">
              <input
                className="input"
                value={edit.subtitle || ""}
                onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })}
                placeholder="Ví dụ: Titan sa mạc. Như mới 99%. Rẻ hơn 7 triệu."
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Chữ trên nút bấm">
                <input
                  className="input"
                  value={edit.ctaText || ""}
                  onChange={(e) => setEdit({ ...edit, ctaText: e.target.value })}
                  placeholder="Ví dụ: Mua ngay, Định giá ngay"
                />
              </Field>

              <Field label="Đường dẫn liên kết (Link)">
                <input
                  className="input"
                  value={edit.link || ""}
                  onChange={(e) => setEdit({ ...edit, link: e.target.value })}
                  placeholder="Ví dụ: /san-pham hoặc /thu-cu"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tông màu nền">
                <select
                  className="input"
                  value={edit.theme || "light"}
                  onChange={(e) => setEdit({ ...edit, theme: e.target.value })}
                >
                  <option value="light">Nền sáng (Trắng)</option>
                  <option value="dark">Nền tối (Đen Titan)</option>
                </select>
              </Field>

              <Field label="Bố cục chia cột">
                <select
                  className="input"
                  value={edit.colSpan ?? 0}
                  onChange={(e) => setEdit({ ...edit, colSpan: Number(e.target.value) })}
                >
                  <option value={0}>Tự động (Vị trí #1 full 2 cột, còn lại 1 cột)</option>
                  <option value={2}>Toàn màn hình (2 cột - Nổi bật)</option>
                  <option value={1}>Nửa màn hình (1 cột)</option>
                </select>
              </Field>
            </div>

            <Field label="Hình ảnh sản phẩm">
              <ImageUploader
                multiple={false}
                value={edit.image ? [edit.image] : []}
                onChange={(imgs) => setEdit({ ...edit, image: imgs[0] || "" })}
              />
            </Field>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={edit.active ?? true}
                  onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
                  className="h-4 w-4 rounded accent-cobalt"
                />
                <span>Đang bật hiển thị trên website</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-mist pt-4">
              <button
                type="button"
                onClick={() => setEdit(null)}
                className="btn-ghost"
              >
                Hủy
              </button>
              <button disabled={busy} className="btn-primary">
                {busy && <Spinner />}
                {edit.id ? "Lưu thay đổi" : "Tạo banner"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
