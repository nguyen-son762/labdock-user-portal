export function getArticlePath(categorySlug: string, articleSlug: string): string {
  return `/news/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`;
}

export function getNewsListPath(categorySlug?: string, page = 1): string {
  const query = new URLSearchParams();
  if (categorySlug) query.set("category", categorySlug);
  if (page > 1) query.set("page", String(page));
  return query.size ? `/news?${query}` : "/news";
}

export function parseNewsPage(value: string | string[] | undefined): number {
  const page = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : 1;
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
