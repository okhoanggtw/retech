"use client";
import { useState } from "react";
import useSWR from "swr";
import { Trash2 } from "lucide-react";
import { api, fetcher } from "@/lib/api";
import { date } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/types";
import { Badge, Skeleton } from "@/components/ui";
import { useToast } from "@/components/Toast";

export default function AdminUsers() {
  const { data, mutate } = useSWR<User[]>("/api/admin/users", fetcher);
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const toast = useToast();
  const act = async (u: User, body: Partial<User>) => {
    try { await api(`/api/admin/users/${u.id}`, { method: "PUT", json: body }); mutate(); toast("Đã cập nhật", "success"); } catch (e) { toast((e as Error).message, "error"); }
  };
  const del = async (u: User) => {
    if (!confirm(`Xóa tài khoản ${u.email}?`)) return;
    try { await api(`/api/admin/users/${u.id}`, { method: "DELETE" }); mutate(); } catch (e) { toast((e as Error).message, "error"); }
  };
  const list = (data ?? []).filter((u) => !q || (u.fullName + u.email + (u.phone ?? "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Người dùng</h1>
      <input className="input max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên, email, SĐT" aria-label="Tìm người dùng" />
      <div className="overflow-x-auto rounded-xl2 bg-white">
        {!data ? <Skeleton className="h-80" /> : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-mist text-left text-graphite"><tr><th className="px-4 py-3 font-medium">Họ tên</th><th className="font-medium">Email</th><th className="font-medium">SĐT</th><th className="font-medium">Ngày tạo</th><th className="font-medium">Vai trò</th><th className="font-medium">Trạng thái</th><th /></tr></thead>
            <tbody className="divide-y divide-mist/70">
              {list.map((u) => {
                const self = u.id === me?.id;
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium">{u.fullName}</td><td>{u.email}</td><td>{u.phone}</td><td>{date(u.createdAt)}</td>
                    <td><select disabled={self} value={u.role} onChange={(e) => act(u, { role: e.target.value as User["role"] })} className="rounded-lg border border-mist px-2 py-1" aria-label="Vai trò"><option value="USER">Khách hàng</option><option value="ADMIN">Quản trị</option></select></td>
                    <td><button disabled={self} onClick={() => act(u, { enabled: !u.enabled })}>{u.enabled ? <Badge tone="bg-grade-soft text-grade">Hoạt động</Badge> : <Badge tone="bg-danger-soft text-danger">Đã khóa</Badge>}</button></td>
                    <td className="pr-3 text-right">{!self && <button onClick={() => del(u)} className="icon-btn inline-grid text-danger" aria-label="Xóa"><Trash2 size={15} /></button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
