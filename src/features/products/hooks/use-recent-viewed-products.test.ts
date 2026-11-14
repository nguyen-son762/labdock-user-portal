import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { productFixture } from "../test/product-fixture";
import { RECENT_VIEWED_STORAGE_KEY, toRecentViewedProduct } from "../utils/recent-viewed-products";
import { useRecentViewedProducts } from "./use-recent-viewed-products";

const firstProduct = toRecentViewedProduct(productFixture);
const secondProduct = toRecentViewedProduct({ ...productFixture, id: "second", slug: "second", name: "Second" });

describe("useRecentViewedProducts", () => {
  afterEach(() => window.sessionStorage.clear());

  it("records viewed products in session storage and returns the others", () => {
    const { result, rerender } = renderHook(({ product }) => useRecentViewedProducts(product), {
      initialProps: { product: firstProduct },
    });

    expect(result.current).toEqual([]);
    expect(JSON.parse(window.sessionStorage.getItem(RECENT_VIEWED_STORAGE_KEY) ?? "[]")).toHaveLength(1);

    rerender({ product: secondProduct });

    expect(result.current.map((product) => product.id)).toEqual([firstProduct.id]);
    expect(
      JSON.parse(window.sessionStorage.getItem(RECENT_VIEWED_STORAGE_KEY) ?? "[]").map(
        (product: { id: string }) => product.id,
      ),
    ).toEqual([secondProduct.id, firstProduct.id]);
  });
});
