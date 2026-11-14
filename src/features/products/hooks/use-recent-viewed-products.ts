"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

import type { Product } from "../products.types";
import {
  addRecentViewedProduct,
  type RecentViewedProduct,
  fromRecentViewedProduct,
  getDisplayedRecentViewedProducts,
  parseRecentViewedProducts,
  RECENT_VIEWED_STORAGE_KEY,
} from "../utils/recent-viewed-products";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStorage(): string | null {
  try {
    return window.sessionStorage.getItem(RECENT_VIEWED_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value: string) {
  try {
    window.sessionStorage.setItem(RECENT_VIEWED_STORAGE_KEY, value);
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

const getServerSnapshot = () => null;

/** Records the product as viewed for this browser session and returns the other recently viewed products. */
export function useRecentViewedProducts(product: RecentViewedProduct): Product[] {
  const rawHistory = useSyncExternalStore(subscribe, readStorage, getServerSnapshot);

  useEffect(() => {
    const history = addRecentViewedProduct(parseRecentViewedProducts(readStorage()), product);
    writeStorage(JSON.stringify(history));
  }, [product]);

  return useMemo(
    () =>
      getDisplayedRecentViewedProducts(parseRecentViewedProducts(rawHistory), product.id).map(fromRecentViewedProduct),
    [rawHistory, product.id],
  );
}
