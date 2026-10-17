export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
const TOKEN_KEY = "retech_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(t: string | null) {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {}
}

export class ApiError extends Error {
  status: number; details?: Record<string, string>;
  constructor(status: number, message: string, details?: Record<string, string>) {
    super(message); this.status = status; this.details = details;
  }
}

export async function api<T = unknown>(path: string, opts: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body = opts.body;
  if (opts.json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(opts.json); }
  let res: Response;
  try {
    res = await fetch(API_URL + path, { ...opts, headers, body });
  } catch {
    throw new ApiError(0, "Không kết nối được máy chủ. Máy chủ miễn phí có thể đang khởi động, thử lại sau 30 giây.");
  }
  if (res.status === 401 && token) setToken(null);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message || (res.status === 401 ? "Vui lòng đăng nhập" : res.status === 403 ? "Bạn không có quyền" : "Có lỗi xảy ra");
    throw new ApiError(res.status, msg, data?.details);
  }
  return data as T;
}

export const fetcher = <T,>(path: string) => api<T>(path);

/** Anh upload len server luu dang "/api/files/xxx" -> them domain backend */
export function imgUrl(src?: string) {
  if (!src) return undefined;
  return src.startsWith("/api/") ? API_URL + src : src;
}
