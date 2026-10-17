"use client";
import { SWRConfig } from "swr";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "./Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ revalidateOnFocus: false, shouldRetryOnError: true, errorRetryCount: 3 }}>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </SWRConfig>
  );
}
