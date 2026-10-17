"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Field, Spinner } from "./ui";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const [f, setF] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr({}); setMsg("");
    try {
      const u = mode === "login" ? await login(f.email, f.password) : await register(f);
      const next = sp.get("next");
      router.push(next || (u.role === "ADMIN" ? "/admin" : "/"));
    } catch (e) {
      const a = e as ApiError;
      setMsg(a.message); setErr(a.details ?? {});
    } finally { setBusy(false); }
  };
  const bind = (k: keyof typeof f) => ({ value: f[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value }) });

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <h1 className="text-center text-4xl font-bold tracking-tightest">{mode === "login" ? "Đăng nhập ReTech." : "Tạo tài khoản."}</h1>
      <p className="mt-3 text-center text-graphite">{mode === "login" ? "Theo dõi đơn hàng và yêu cầu thu cũ của bạn." : "Chỉ mất 30 giây để bắt đầu mua sắm."}</p>
      <form onSubmit={submit} className="mt-10 space-y-4">
        {mode === "register" && (
          <>
            <Field label="Họ và tên" error={err.fullName}><input className="input" required autoComplete="name" {...bind("fullName")} /></Field>
            <Field label="Số điện thoại" error={err.phone}><input className="input" type="tel" autoComplete="tel" {...bind("phone")} /></Field>
          </>
        )}
        <Field label="Email" error={err.email}><input className="input" type="email" required autoComplete="email" {...bind("email")} /></Field>
        <Field label="Mật khẩu" error={err.password} hint={mode === "register" ? "Tối thiểu 6 ký tự" : undefined}>
          <input className="input" type="password" required minLength={mode === "register" ? 6 : undefined} autoComplete={mode === "login" ? "current-password" : "new-password"} {...bind("password")} />
        </Field>
        {msg && <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">{msg}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy && <Spinner />}{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-graphite">
        {mode === "login" ? <>Chưa có tài khoản? <Link href={`/dang-ky${sp.get("next") ? `?next=${sp.get("next")}` : ""}`} className="link">Đăng ký</Link></>
          : <>Đã có tài khoản? <Link href="/dang-nhap" className="link">Đăng nhập</Link></>}
      </p>
      {mode === "login" && <p className="mt-8 rounded-xl bg-white p-4 text-center text-xs text-graphite">Tài khoản dùng thử: <b>khach1@retech.vn</b> / <b>123456</b></p>}
    </div>
  );
}
