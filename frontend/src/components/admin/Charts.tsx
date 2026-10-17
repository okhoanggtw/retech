"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { vnd, vndShort } from "@/lib/format";

const INK2 = "#6E6E73", GRID = "#E5E5EA", MARK = "#2F4BFF";
const tip = { contentStyle: { borderRadius: 12, border: "1px solid #E5E5EA", fontSize: 13 }, cursor: { fill: "rgba(47,75,255,0.06)" } };

export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={MARK} stopOpacity={0.22} /><stop offset="1" stopColor={MARK} stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(8, 10) + "/" + d.slice(5, 7)} tick={{ fill: INK2, fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tickFormatter={(v: number) => vndShort(v)} tick={{ fill: INK2, fontSize: 12 }} axisLine={false} tickLine={false} width={64} />
        <Tooltip {...tip} cursor={{ stroke: INK2, strokeDasharray: "3 3" }}
          formatter={(v: number, k: string) => (k === "revenue" ? [vnd(v), "Doanh thu"] : [v, "Đơn"])}
          labelFormatter={(d: string) => new Date(d).toLocaleDateString("vi-VN")} />
        <Area type="monotone" dataKey="revenue" stroke={MARK} strokeWidth={2} fill="url(#rev)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function HBar({ data, money = true, height = 240 }: { data: { name: string; value: number }[]; money?: boolean; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={6}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" tickFormatter={(v: number) => (money ? vndShort(v) : String(v))} tick={{ fill: INK2, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fill: "#1D1D1F", fontSize: 13 }} axisLine={false} tickLine={false} width={96} />
        <Tooltip {...tip} formatter={(v: number) => [money ? vnd(v) : v, money ? "Doanh thu" : "Số lượng"]} />
        <Bar dataKey="value" fill={MARK} radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
