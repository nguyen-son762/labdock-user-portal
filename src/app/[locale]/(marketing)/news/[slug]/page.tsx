import { notFound, permanentRedirect } from "next/navigation";

import { ArticleNotFoundError, findArticleCategory } from "@/features/news/server";
import { getArticlePath } from "@/features/news/utils/news-paths";
import { getLocalizedPath, isAppLocale } from "@/i18n/locale";

export default async function LegacyNewsArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  try {
    const article = await findArticleCategory(slug);
    permanentRedirect(getLocalizedPath(getArticlePath(article.categorySlug, article.slug), locale));
  } catch (error) {
    if (error instanceof ArticleNotFoundError) notFound();
    throw error;
  }
}
