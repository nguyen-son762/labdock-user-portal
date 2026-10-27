import { cache } from "react";
import { z } from "zod";

import { clientEnv } from "@/config/client-env";
import { createServerApiRequestInit } from "@/lib/server-api-request";

import { articleCategoriesSchema, articleDetailSchema, articlesPageSchema } from "./schemas/news.schema";
import { getArticlePath } from "./utils/news-paths";

export class ArticleNotFoundError extends Error {
  constructor() {
    super("Article or category not found.");
    this.name = "ArticleNotFoundError";
  }
}

async function fetchArticlesApi(path: string, tags: string[]): Promise<unknown> {
  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_BASE_URL}${path}`,
    await createServerApiRequestInit({ revalidate: 300, tags: ["articles", ...tags] }),
  );
  if (response.status === 404) throw new ArticleNotFoundError();
  if (!response.ok) throw new Error(`Unable to load articles (${response.status}).`);
  return response.json();
}

export const getArticleCategories = cache(async () =>
  articleCategoriesSchema.parse(await fetchArticlesApi("/article-categories", ["article-categories"])),
);

export const getArticlesByCategory = cache(async (categorySlug: string, page = 1, pageSize = 4) => {
  z.number().int().positive().parse(page);
  z.number().int().positive().parse(pageSize);
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return articlesPageSchema.parse(
    await fetchArticlesApi(`/article-categories/${encodeURIComponent(categorySlug)}/articles?${query}`, [
      `articles:${categorySlug}`,
    ]),
  );
});

export const getArticleDetail = cache(async (categorySlug: string, articleSlug: string) =>
  articleDetailSchema.parse(
    await fetchArticlesApi(
      `/article-categories/${encodeURIComponent(categorySlug)}/articles/${encodeURIComponent(articleSlug)}`,
      [`articles:${categorySlug}`, `article:${categorySlug}:${articleSlug}`],
    ),
  ),
);

// Preserve previously shared /news/{articleSlug} links with a canonical redirect.
export async function findArticleCategory(articleSlug: string) {
  const categories = await getArticleCategories();
  const results = await Promise.allSettled(categories.map((category) => getArticleDetail(category.slug, articleSlug)));
  for (const result of results) {
    if (result.status === "fulfilled") return result.value;
  }
  const failure = results.find(
    (result) => result.status === "rejected" && !(result.reason instanceof ArticleNotFoundError),
  );
  if (failure?.status === "rejected") throw failure.reason;
  throw new ArticleNotFoundError();
}

export async function getArticleSitemapEntries() {
  const categories = await getArticleCategories();
  const entries = await Promise.all(
    categories.map(async (category) => {
      const firstPage = await getArticlesByCategory(category.slug, 1, 100);
      const items = [...firstPage.items];
      const pageCount = Math.ceil(firstPage.total / firstPage.pageSize);
      for (let page = 2; page <= pageCount; page += 1) {
        items.push(...(await getArticlesByCategory(category.slug, page, firstPage.pageSize)).items);
      }
      return items.map((article) => ({ path: getArticlePath(category.slug, article.slug) }));
    }),
  );
  return [...new Map(entries.flat().map((entry) => [entry.path, entry])).values()];
}
