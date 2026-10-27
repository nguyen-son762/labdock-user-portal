import { isValidElement, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/news", () => ({ NewsDetailScreen: () => null }));
vi.mock("@/features/news/server", () => ({ getArticleDetail: vi.fn(), ArticleNotFoundError: class extends Error {} }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import { ArticleNotFoundError, getArticleDetail } from "@/features/news/server";
import { articleDetail } from "@/features/news/test/article-fixtures";

import ArticlePage, { generateMetadata } from "./page";

const props = {
  params: Promise.resolve({ locale: "vi", slug: articleDetail.categorySlug, articleSlug: articleDetail.slug }),
};

beforeEach(() => vi.mocked(getArticleDetail).mockResolvedValue(articleDetail));

describe("article detail route", () => {
  it("uses the API article for localized SEO metadata", async () => {
    const metadata = await generateMetadata(props);
    expect(metadata.title).toBe(articleDetail.title);
    expect(metadata.alternates?.canonical).toBe("/vi/news/research-updates/new-laboratory-research");
    expect(metadata.description).toContain("New laboratory methods.");
    expect(metadata.description).not.toContain("<p>");
  });

  it("escapes structured data and does not treat endDate as a modification date", async () => {
    vi.mocked(getArticleDetail).mockResolvedValue({ ...articleDetail, title: "</script><script>alert(1)</script>" });
    const result = await ArticlePage(props);
    if (!isValidElement<{ children: ReactElement[] }>(result)) throw new Error("Missing page");
    const script = result.props.children[0];
    if (!isValidElement<{ dangerouslySetInnerHTML: { __html: string } }>(script)) throw new Error("Missing JSON-LD");
    const json = script.props.dangerouslySetInnerHTML.__html;
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)).toMatchObject({
      headline: "</script><script>alert(1)</script>",
      datePublished: articleDetail.startDate,
    });
    expect(JSON.parse(json)).not.toHaveProperty("dateModified");
  });

  it("maps missing articles to not found but preserves upstream failures", async () => {
    vi.mocked(getArticleDetail).mockRejectedValueOnce(new ArticleNotFoundError());
    await expect(ArticlePage(props)).rejects.toThrow("NEXT_NOT_FOUND");
    vi.mocked(getArticleDetail).mockRejectedValueOnce(new Error("Upstream unavailable"));
    await expect(ArticlePage(props)).rejects.toThrow("Upstream unavailable");
  });
});
