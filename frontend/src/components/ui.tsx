import { Loader2 } from "lucide-react";
import Link from "next/link";

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} size={18} aria-label="Đang tải" />;
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-page px-4 pb-8 pt-14 md:px-6 md:pt-20">
      <h1 className="text-4xl font-bold tracking-tightest md:text-6xl">{title}</h1>
      {sub && <p className="mt-3 max-w-2xl text-lg text-graphite md:text-xl">{sub}</p>}
    </div>
  );
}

export function Empty({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="rounded-xl2 bg-white px-6 py-16 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {action && href && <Link href={href} className="btn-primary mt-5 inline-flex">{action}</Link>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl2 bg-black/[0.05] ${className}`} />;
}

export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>{children}</span>;
}

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-graphite">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
