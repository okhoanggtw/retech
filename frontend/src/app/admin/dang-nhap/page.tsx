"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui";

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@retech.vn");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      const u = await login(email, password);
      if (u.role !== "ADMIN") { logout(); setMsg("Tài khoản này không có quyền quản trị."); }
      else router.push("/admin");
    } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-black px-4">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="text-center text-3xl font-bold text-white">ReTech <span className="text-white/50">Admin</span></p>
        <p className="mt-2 text-center text-sm text-white/50">Đăng nhập bằng tài khoản quản trị</p>
        <div className="mt-8 space-y-3">
          <input className="input border-white/10 bg-white/5 text-white" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" placeholder="Email" />
          <input className="input border-white/10 bg-white/5 text-white" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Mật khẩu" placeholder="Mật khẩu" />
          {msg && <p className="text-sm text-[#FF6B6B]" role="alert">{msg}</p>}
          <button disabled={busy} className="btn-primary w-full">{busy && <Spinner />}Đăng nhập</button>
        </div>
        <p className="mt-6 text-center text-sm"><Link href="/" className="text-white/50 hover:text-white">Quay lại website</Link></p>
      </form>
    </div>
  );
}
