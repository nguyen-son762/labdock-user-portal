import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClient = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/http-client", () => ({ httpClient }));

import { productFixture } from "../test/product-fixture";
import { productsService } from "./products.service";

beforeEach(() => httpClient.get.mockReset());

describe("productsService.getBySlug", () => {
  it("loads and validates current detail by encoded slug without reordering variants", async () => {
    httpClient.get.mockResolvedValue({ data: { ...productFixture, notes: null, related: null } });
    const controller = new AbortController();

    const result = await productsService.getBySlug("example slug", controller.signal);

    expect(httpClient.get).toHaveBeenCalledExactlyOnceWith("/products/example%20slug", { signal: controller.signal });
    expect(result.variants).toEqual(productFixture.variants);
    expect(result.notes).toBe("");
    expect(result.related).toEqual([]);
  });

  it("propagates failure without returning stale detail", async () => {
    const error = new Error("Product unavailable");
    httpClient.get.mockRejectedValue(error);
    await expect(productsService.getBySlug(productFixture.slug)).rejects.toBe(error);
    expect(httpClient.get).toHaveBeenCalledOnce();
  });

  it("rejects malformed variant identifiers", async () => {
    httpClient.get.mockResolvedValue({
      data: {
        ...productFixture,
        variants: [{ ...productFixture.variants[0], id: "invalid" }],
      },
    });
    await expect(productsService.getBySlug(productFixture.slug)).rejects.toThrow();
  });
});
