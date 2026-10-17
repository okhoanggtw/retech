import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { Order } from "@/lib/types";

export interface Stats {
  revenue: number; revenueThisMonth: number; revenueLastMonth: number; totalOrders: number; pendingOrders: number;
  totalProducts: number; lowStockProducts: number; totalUsers: number; newUsersThisMonth: number;
  tradeInRequests: number; newTradeIns: number; chatbotQuestions: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { name: string; value: number }[]; revenueByCategory: { name: string; value: number }[];
  revenueByBrand: { name: string; value: number }[]; paymentMethods: { name: string; value: number }[];
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[]; recentOrders: Order[];
}
export const useStats = (days = 30) => useSWR<Stats>(`/api/admin/stats?days=${days}`, fetcher);
