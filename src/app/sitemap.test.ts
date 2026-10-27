import { beforeEach, describe, expect, it, vi } from "vitest";

import { getArticleSitemapEntries } from "@/features/news/server";
import { getPublicProducts } from "@/features/products/server";
import { routing } from "@/i18n/routing";

import sitemap from "./sitemap";

vi.mock("@/features/products/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/products/server")>()),
  getPublicProducts: vi.fn(),
}));
vi.mock("@/features/news/server", () => ({ getArticleSitemapEntries: vi.fn() }));
const record = (slug: string) => ({
  id: "11111111-1111-1111-1111-111111111111",
  slug,
  name: "QA Product",
  productNo: "QA-001",
  brandName: "QA Brand",
  primaryImageUrl: null,
  priceVisible: true,
  fromPrice: 10,
  currency: "SGD",
  outOfStock: false,
  publishedAt: "2026-08-21T00:00:00Z",
  isNew: false,
  isOutstanding: false,
});
beforeEach(() => {
  vi.mocked(getArticleSitemapEntries).mockResolvedValue([{ path: "/news/science/real-article" }]);
  vi.mocked(getPublicProducts).mockResolvedValue({
    items: [record("real-api-slug")],
    page: 1,
    pageSize: 100,
    total: 1,
  });
});

describe("sitemap", () => {
  it("contains unique public URLs", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((url) => url.endsWith("/security"))).toBe(true);
    expect(urls.some((url) => /\/(cart|profile|checkout|orders|rfqs)(\/|$)/.test(url))).toBe(false);
  });

  it("SEO-003 indexes API product slugs instead of demo product identifiers", async () => {
    const productUrls = (await sitemap()).filter((entry) => entry.url.includes("/products/"));
    expect(productUrls).toHaveLength(routing.locales.length);
    expect(new Set(productUrls.map((entry) => entry.url.split("/").at(-1)))).toEqual(new Set(["real-api-slug"]));
    expect(productUrls.every((entry) => Object.keys(entry.alternates?.languages ?? {}).length === 3)).toBe(true);
  });

  it("reads subsequent API pages and deduplicates repeated slugs", async () => {
    vi.mocked(getPublicProducts)
      .mockResolvedValueOnce({ items: [record("first")], page: 1, pageSize: 1, total: 3 })
      .mockResolvedValueOnce({ items: [record("second")], page: 2, pageSize: 1, total: 3 })
      .mockResolvedValueOnce({ items: [record("first")], page: 3, pageSize: 1, total: 3 });
    const entries = await sitemap();
    expect(getPublicProducts).toHaveBeenCalledTimes(3);
    expect(entries.filter((entry) => entry.url.includes("/products/"))).toHaveLength(2 * routing.locales.length);
  });

  it("only supplies evidence-based modification dates", async () => {
    const datedEntries = (await sitemap()).filter((entry) => entry.lastModified !== undefined);
    expect(datedEntries).toHaveLength(0);
    const articleEntries = (await sitemap()).filter((entry) => entry.url.includes("/news/"));
    expect(articleEntries).toHaveLength(routing.locales.length);
    expect(articleEntries.every((entry) => entry.url.endsWith("/news/science/real-article"))).toBe(true);
    expect(datedEntries.every((entry) => entry.url.includes("/news/"))).toBe(true);
  });
});
