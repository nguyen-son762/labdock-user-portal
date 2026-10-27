import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site";
import { NewsDetailScreen } from "@/features/news";
import { ArticleNotFoundError, getArticleDetail } from "@/features/news/server";
import { getArticleDescription } from "@/features/news/utils/article-content";
import { getArticleImageUrl } from "@/features/news/utils/article-image-url";
import { getArticlePath } from "@/features/news/utils/news-paths";
import { getLocalizedAlternates, getLocalizedPath, isAppLocale } from "@/i18n/locale";

type ArticlePageProps = { params: Promise<{ locale: string; slug: string; articleSlug: string }> };

async function loadArticle(categorySlug: string, articleSlug: string) {
  try {
    return await getArticleDetail(categorySlug, articleSlug);
  } catch (error) {
    if (error instanceof ArticleNotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, slug, articleSlug } = await params;
  if (!isAppLocale(locale)) return {};
  const article = await loadArticle(slug, articleSlug);
  const path = getArticlePath(article.categorySlug, article.slug);
  const description = getArticleDescription(article.content) || article.title;
  const image = getArticleImageUrl(article.thumbnailUrl);
  return {
    title: article.title,
    description,
    alternates: getLocalizedAlternates(path, locale),
    openGraph: {
      type: "article",
      title: article.title,
      description,
      publishedTime: article.startDate,
      url: getLocalizedPath(path, locale),
      locale: locale === "vi" ? "vi_VN" : "en_SG",
      images: image ? [{ url: image, alt: article.title }] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug, articleSlug } = await params;
  if (!isAppLocale(locale)) notFound();
  const article = await loadArticle(slug, articleSlug);
  const image = getArticleImageUrl(article.thumbnailUrl);
  const url = `${siteConfig.url}${getLocalizedPath(getArticlePath(article.categorySlug, article.slug), locale)}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: getArticleDescription(article.content) || article.title,
    datePublished: article.startDate,
    ...(image ? { image: new URL(image, siteConfig.url).toString() } : {}),
    inLanguage: locale,
    mainEntityOfPage: url,
    url,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/auth/labdock-wordmark.svg` },
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replaceAll("<", "\\u003c") }}
      />
      <NewsDetailScreen article={article} />
    </>
  );
}
