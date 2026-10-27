import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getArticleSitemapEntries } from "@/features/news/server";
import { getPublicProducts } from "@/features/products/server";
import { getLanguageAlternates, getLocalizedPath } from "@/i18n/locale";
import { routing, type AppLocale } from "@/i18n/routing";

const absoluteLanguages = (path: string) =>
  Object.fromEntries(
    Object.entries(getLanguageAlternates(path)).map(([locale, localizedPath]) => [
      locale,
      `${siteConfig.url}${localizedPath}`,
    ]),
  );

const createLocalizedEntries = (path: string, attributes: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">) =>
  routing.locales.map((locale: AppLocale) => ({
    url: `${siteConfig.url}${getLocalizedPath(path, locale)}`,
    alternates: { languages: absoluteLanguages(path) },
    ...attributes,
  }));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const firstPage = await getPublicProducts({ page: 1, pageSize: 100 });
  const slugs = new Set(firstPage.items.map((product) => product.slug));
  const pageCount = Math.ceil(firstPage.total / firstPage.pageSize);
  for (let page = 2; page <= pageCount; page += 1) {
    const result = await getPublicProducts({ page, pageSize: firstPage.pageSize });
    result.items.forEach((product) => slugs.add(product.slug));
  }
  const productEntries = [...slugs].flatMap((slug) =>
    createLocalizedEntries(`/products/${encodeURIComponent(slug)}`, { changeFrequency: "weekly", priority: 0.7 }),
  );

  const articles = (await getArticleSitemapEntries()).flatMap(({ path }) =>
    createLocalizedEntries(path, { changeFrequency: "monthly", priority: 0.6 }),
  );

  return [
    ...createLocalizedEntries("/", { changeFrequency: "weekly", priority: 1 }),
    ...createLocalizedEntries("/products", { changeFrequency: "daily", priority: 0.9 }),
    ...createLocalizedEntries("/news", { changeFrequency: "weekly", priority: 0.8 }),
    ...createLocalizedEntries("/about-us", { changeFrequency: "monthly", priority: 0.7 }),
    ...createLocalizedEntries("/contact-us", { changeFrequency: "monthly", priority: 0.7 }),
    ...createLocalizedEntries("/security", { changeFrequency: "yearly", priority: 0.4 }),
    ...createLocalizedEntries("/terms-and-conditions", { changeFrequency: "yearly", priority: 0.3 }),
    ...createLocalizedEntries("/privacy", { changeFrequency: "yearly", priority: 0.3 }),
    ...productEntries,
    ...articles,
  ];
}
