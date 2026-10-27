import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { NewsListScreen } from "@/features/news";
import { ArticleNotFoundError, getArticleCategories, getArticlesByCategory } from "@/features/news/server";
import { getNewsListPath, parseNewsPage } from "@/features/news/utils/news-paths";
import { getLocalizedAlternates, getLocalizedPath, isAppLocale } from "@/i18n/locale";

type NewsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: NewsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const query = await searchParams;
  const categorySlug = typeof query.category === "string" ? query.category : undefined;
  const categories = await getArticleCategories();
  const category = categorySlug ? categories.find((entry) => entry.slug === categorySlug) : categories[0];
  if (categorySlug && !category) notFound();
  const path = getNewsListPath(category?.slug, parseNewsPage(query.page));
  const t = await getTranslations("RouteMetadata");
  const title = category ? `${category.name} | ${t("news")}` : t("news");
  return {
    title,
    description: t("newsDescription"),
    alternates: getLocalizedAlternates(path, locale),
    openGraph: {
      title,
      description: t("newsDescription"),
      url: getLocalizedPath(path, locale),
      locale: locale === "vi" ? "vi_VN" : "en_SG",
      images: [{ url: "/news/news-header.png", alt: "Labdock news and scientific events" }],
    },
  };
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const query = await searchParams;
  const categories = await getArticleCategories();
  const categorySlug = typeof query.category === "string" ? query.category : undefined;
  const category = categorySlug ? categories.find((entry) => entry.slug === categorySlug) : categories[0];
  if (categorySlug && !category) notFound();
  const page = parseNewsPage(query.page);
  try {
    const articles = category
      ? await getArticlesByCategory(category.slug, page, 4)
      : { items: [], page: 1, pageSize: 4, total: 0 };
    if (page > Math.max(1, Math.ceil(articles.total / articles.pageSize))) notFound();
    return <NewsListScreen categories={categories} category={category} articles={articles} />;
  } catch (error) {
    if (error instanceof ArticleNotFoundError) notFound();
    throw error;
  }
}
