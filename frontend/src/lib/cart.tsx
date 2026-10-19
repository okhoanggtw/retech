"use client";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { api, fetcher } from "./api";
import { useAuth } from "./auth";
import { useToast } from "@/components/Toast";
import type { CartView } from "./types";

export function useCart() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { data, mutate, isLoading } = useSWR<CartView>(user ? "/api/cart" : null, fetcher);

  const add = async (productId: string, quantity = 1, quiet = false) => {
    if (!user) {
      toast("Đăng nhập để thêm vào giỏ hàng");
      router.push("/dang-nhap?next=" + encodeURIComponent(location.pathname));
      return false;
    }
    try {
      const c = await api<CartView>("/api/cart/items", { method: "POST", json: { productId, quantity } });
      mutate(c, false);
      if (!quiet) toast("Đã thêm vào giỏ hàng", "success");
      return true;
    } catch (e) { toast((e as Error).message, "error"); return false; }
  };
  const update = async (productId: string, quantity: number) => {
    try {
      const c = await api<CartView>(`/api/cart/items/${productId}`, { method: "PUT", json: { quantity } });
      mutate(c, false);
    } catch (e) { toast((e as Error).message, "error"); }
  };
  return { cart: data, isLoading, add, update, mutate, count: data?.totalQuantity ?? 0 };
}
