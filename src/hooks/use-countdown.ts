"use client";

import { useEffect, useState } from "react";

export function useCountdown(expiresAt: string | null): number | null {
  const [countdown, setCountdown] = useState<{ expiresAt: string | null; seconds: number } | null>(null);
  useEffect(() => {
    if (!expiresAt) return;
    const deadline = Date.parse(expiresAt);
    if (!Number.isFinite(deadline)) return;
    const update = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setCountdown({ expiresAt, seconds });
      return seconds;
    };
    if (update() === 0) return;
    const interval = window.setInterval(() => {
      if (update() === 0) window.clearInterval(interval);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);
  return countdown?.expiresAt === expiresAt ? countdown.seconds : null;
}
