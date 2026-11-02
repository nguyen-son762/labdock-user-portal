"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { authTokenStore } from "@/lib/auth-token-store";

function shouldRetryRequest(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) {
    return false;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return status === undefined || status === 408 || status === 429 || status >= 500;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: shouldRetryRequest,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: false },
        },
      }),
  );

  useEffect(() => authTokenStore.onClear(() => queryClient.clear()), [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
