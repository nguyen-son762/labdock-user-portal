"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { authTokenStore } from "@/lib/auth-token-store";

export function AuthTokenRefreshSync() {
  const router = useRouter();

  useEffect(() => authTokenStore.onRefresh(() => router.refresh()), [router]);

  return null;
}
