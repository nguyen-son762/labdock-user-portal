import { describe, expect, it } from "vitest";

import { productFixture } from "../test/product-fixture";
import {
  addRecentViewedProduct,
  fromRecentViewedProduct,
  getDisplayedRecentViewedProducts,
  MAX_RECENT_VIEWED_PRODUCTS,
  parseRecentViewedProducts,
  type RecentViewedProduct,
  toRecentViewedProduct,
} from "./recent-viewed-products";

function createSnapshot(index: number): RecentViewedProduct {
  return toRecentViewedProduct({ ...productFixture, id: `product-${index}`, slug: `product-${index}` });
}

describe("recent viewed products", () => {
  it("keeps only card fields and maps back to a renderable product", () => {
    const snapshot = toRecentViewedProduct(productFixture);
    const product = fromRecentViewedProduct(snapshot);

    expect(snapshot).not.toHaveProperty("description");
    expect(product).toMatchObject({
      id: productFixture.id,
      slug: productFixture.slug,
      name: productFixture.name,
      brandName: productFixture.brandName,
      priceVisible: productFixture.priceVisible,
    });
    expect(product.variants[0]).toMatchObject({ unitPrice: 100, stockQty: 10, selections: [] });
  });

  it("moves a revisited product to the front without duplicates", () => {
    const history = [createSnapshot(1), createSnapshot(2), createSnapshot(3)];

    expect(addRecentViewedProduct(history, createSnapshot(2)).map((item) => item.id)).toEqual([
      "product-2",
      "product-1",
      "product-3",
    ]);
  });

  it("displays at most six products and excludes the current product", () => {
    let history: RecentViewedProduct[] = [];
    for (let index = 1; index <= 10; index += 1) history = addRecentViewedProduct(history, createSnapshot(index));

    const displayed = getDisplayedRecentViewedProducts(history, "product-10");

    expect(displayed).toHaveLength(MAX_RECENT_VIEWED_PRODUCTS);
    expect(displayed.map((item) => item.id)).toEqual([
      "product-9",
      "product-8",
      "product-7",
      "product-6",
      "product-5",
      "product-4",
    ]);
  });

  it("treats malformed storage content as an empty history", () => {
    expect(parseRecentViewedProducts(null)).toEqual([]);
    expect(parseRecentViewedProducts("not json")).toEqual([]);
    expect(parseRecentViewedProducts(JSON.stringify([{ id: 1 }]))).toEqual([]);
  });
});
