import { isValidElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/news", () => ({ NewsListScreen: () => null }));
vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string) => key }));
vi.mock("@/features/news/server", () => ({
  getArticleCategories: vi.fn(),
  getArticlesByCategory: vi.fn(),
  ArticleNotFoundError: class extends Error {},
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import { getArticleCategories, getArticlesByCategory } from "@/features/news/server";
import { articleCategory, articlesPage } from "@/features/news/test/article-fixtures";

import NewsPage, { generateMetadata } from "./page";

beforeEach(() => {
  vi.mocked(getArticleCategories).mockResolvedValue([articleCategory]);
  vi.mocked(getArticlesByCategory).mockResolvedValue(articlesPage);
});

describe("news listing route", () => {
  it("uses one canonical URL for the default and explicit first category", async () => {
    const params = Promise.resolve({ locale: "en" });
    const initial = await generateMetadata({ params, searchParams: Promise.resolve({}) });
    const explicit = await generateMetadata({
      params,
      searchParams: Promise.resolve({ category: articleCategory.slug }),
    });
    expect(initial.alternates?.canonical).toBe("/news?category=research-updates");
    expect(initial.alternates).toEqual(explicit.alternates);
    expect(initial.title).toBe("Research updates | news");
  });
  it("loads the default category and renders API pagination without dropping items", async () => {
    const screen = await NewsPage({ params: Promise.resolve({ locale: "en" }), searchParams: Promise.resolve({}) });
    expect(getArticlesByCategory).toHaveBeenCalledWith(articleCategory.slug, 1, 4);
    if (!isValidElement<{ articles: typeof articlesPage }>(screen)) throw new Error("Missing screen");
    expect(screen.props.articles).toEqual(articlesPage);
  });

  it("loads the requested category page", async () => {
    await NewsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ category: articleCategory.slug, page: "2" }),
    });
    expect(getArticlesByCategory).toHaveBeenCalledWith(articleCategory.slug, 2, 4);
  });

  it("renders empty categories without fetching an article page", async () => {
    vi.mocked(getArticleCategories).mockResolvedValue([]);
    await NewsPage({ params: Promise.resolve({ locale: "en" }), searchParams: Promise.resolve({}) });
    expect(getArticlesByCategory).not.toHaveBeenCalled();
  });

  it("returns not found for unknown categories or pages beyond the API total", async () => {
    await expect(
      NewsPage({ params: Promise.resolve({ locale: "en" }), searchParams: Promise.resolve({ category: "missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(
      NewsPage({ params: Promise.resolve({ locale: "en" }), searchParams: Promise.resolve({ page: "4" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("propagates API failures to the route error boundary", async () => {
    vi.mocked(getArticlesByCategory).mockRejectedValue(new Error("Upstream unavailable"));
    await expect(
      NewsPage({ params: Promise.resolve({ locale: "en" }), searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("Upstream unavailable");
  });
});
