import { afterEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({ get: vi.fn<() => { value: string } | undefined>() }));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }));

import {
  ArticleNotFoundError,
  findArticleCategory,
  getArticleCategories,
  getArticleDetail,
  getArticlesByCategory,
  getArticleSitemapEntries,
} from "./server";
import { articleCategory, articleDetail, articlesPage } from "./test/article-fixtures";

const base = "https://uat-api-labdock.365studio.vn/api/public/v1";
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });

afterEach(() => vi.unstubAllGlobals());

describe("article API", () => {
  it("loads categories and preserves backend field names", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([articleCategory]));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getArticleCategories()).resolves.toEqual([articleCategory]);
    expect(fetchMock).toHaveBeenCalledWith(`${base}/article-categories`, {
      next: { revalidate: 300, tags: ["articles", "article-categories"] },
    });
  });

  it("encodes category paths and sends the requested API pagination", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ...articlesPage, page: 2, pageSize: 8 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getArticlesByCategory("news / events", 2, 8)).resolves.toEqual({
      ...articlesPage,
      page: 2,
      pageSize: 8,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${base}/article-categories/news%20%2F%20events/articles?page=2&pageSize=8`,
      {
        next: { revalidate: 300, tags: ["articles", "articles:news / events"] },
      },
    );
  });

  it("loads article detail including HTML without renaming its fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(articleDetail));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getArticleDetail("science", "a/b")).resolves.toEqual(articleDetail);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${base}/article-categories/science/articles/a%2Fb`);
  });

  it("does not put authenticated responses into a public cache", async () => {
    cookieStore.get.mockReturnValueOnce({ value: "token" });
    const fetchMock = vi.fn().mockResolvedValue(json([articleCategory]));
    vi.stubGlobal("fetch", fetchMock);
    await getArticleCategories();
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: "Bearer token" },
      cache: "no-store",
    });
  });

  it("distinguishes not found from upstream failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(json({}, 404)).mockResolvedValueOnce(json({}, 503)));
    await expect(getArticleDetail("news", "missing")).rejects.toBeInstanceOf(ArticleNotFoundError);
    await expect(getArticleDetail("news", "broken")).rejects.toThrow("503");
  });

  it("rejects invalid API data and invalid pagination", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(json({ ...articlesPage, items: [{ ...articlesPage.items[0], startDate: "invalid" }] }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getArticlesByCategory("news")).rejects.toThrow();
    await expect(getArticlesByCategory("news", 0)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("accepts empty categories and empty article pages", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(json([]))
        .mockResolvedValueOnce(json({ items: [], page: 1, pageSize: 4, total: 0 })),
    );
    await expect(getArticleCategories()).resolves.toEqual([]);
    await expect(getArticlesByCategory("empty")).resolves.toEqual({ items: [], page: 1, pageSize: 4, total: 0 });
  });

  it("finds canonical categories for legacy article links", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(json([articleCategory, { ...articleCategory, slug: "other" }]))
        .mockResolvedValueOnce(json({}, 404))
        .mockResolvedValueOnce(json(articleDetail)),
    );
    await expect(findArticleCategory(articleDetail.slug)).resolves.toEqual(articleDetail);
  });

  it("does not report an upstream failure as a missing legacy article", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(json([articleCategory]))
        .mockResolvedValueOnce(json({}, 500)),
    );
    await expect(findArticleCategory("missing")).rejects.toThrow("500");
  });

  it("includes all category pages and deduplicates sitemap article paths", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json([articleCategory]))
      .mockResolvedValueOnce(json({ ...articlesPage, pageSize: 1, total: 3 }))
      .mockResolvedValueOnce(
        json({ ...articlesPage, items: [{ ...articlesPage.items[0], slug: "second" }], page: 2, pageSize: 1 }),
      )
      .mockResolvedValueOnce(json({ ...articlesPage, page: 3, pageSize: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getArticleSitemapEntries()).resolves.toEqual([
      { path: "/news/research-updates/new-laboratory-research" },
      { path: "/news/research-updates/second" },
    ]);
    expect(fetchMock.mock.calls[3]?.[0]).toContain("page=3&pageSize=1");
  });
});
