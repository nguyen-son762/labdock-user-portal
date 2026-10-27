import { ArrowLeft, ArrowRight } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/class-names";
import { Link } from "@/i18n/navigation";

import type { ArticleCategory, ArticlesPage } from "../schemas/news.schema";
import { getNewsListPath } from "../utils/news-paths";
import { NewsArticleRow } from "./news-article-row";

export function NewsFeed({
  categories,
  category,
  articles,
}: {
  categories: ArticleCategory[];
  category?: ArticleCategory;
  articles: ArticlesPage;
}) {
  const t = useTranslations("News");
  const pageCount = Math.max(1, Math.ceil(articles.total / articles.pageSize));
  const pages = [...new Set([1, articles.page - 1, articles.page, articles.page + 1, pageCount])]
    .filter((page) => page > 0 && page <= pageCount)
    .sort((a, b) => a - b);

  return (
    <section aria-labelledby="latest-updates-heading">
      <h2 id="latest-updates-heading" className="text-[32px] font-semibold leading-none text-[#0f3678]">
        {t("latestUpdates")}
      </h2>
      <nav className="mt-4 flex flex-wrap gap-1" aria-label={t("filterCategories")}>
        {categories.map((entry) => (
          <Button
            asChild
            key={entry.id}
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 rounded-full px-3 text-sm font-medium",
              category?.slug === entry.slug
                ? "bg-[#d1ecfa] text-[#092661] hover:bg-[#c5e7f8]"
                : "bg-[#ecf0f3] text-[#73798f]",
            )}
          >
            <Link href={getNewsListPath(entry.slug)} aria-current={category?.slug === entry.slug ? "page" : undefined}>
              {entry.name}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-4 rounded-xl bg-white px-4">
        {category && articles.items.length ? (
          articles.items.map((article) => <NewsArticleRow key={article.id} article={article} category={category} />)
        ) : (
          <p className="py-16 text-center text-sm text-[#73798f]">{t("noArticles")}</p>
        )}
        {category && pageCount > 1 ? (
          <nav
            aria-label={t("pagination")}
            className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e9eaeb] py-4"
          >
            <Button
              asChild={articles.page > 1}
              variant="ghost"
              size="sm"
              disabled={articles.page <= 1}
              className="gap-2 px-0 text-[#73798f]"
            >
              {articles.page > 1 ? (
                <Link href={getNewsListPath(category.slug, articles.page - 1)} rel="prev">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  {t("previous")}
                </Link>
              ) : (
                <span>{t("previous")}</span>
              )}
            </Button>
            <div className="flex items-center gap-1">
              {pages.map((page, index) => (
                <span key={page} className="flex items-center gap-1">
                  {index > 0 && page > (pages[index - 1] ?? 0) + 1 ? <span aria-hidden="true">…</span> : null}
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-8 rounded-full text-xs text-[#73798f]",
                      articles.page === page && "bg-[#d1ecfa] text-[#092661]",
                    )}
                  >
                    <Link
                      href={getNewsListPath(category.slug, page)}
                      aria-label={t("goToPage", { page })}
                      aria-current={articles.page === page ? "page" : undefined}
                    >
                      {page}
                    </Link>
                  </Button>
                </span>
              ))}
            </div>
            <Button
              asChild={articles.page < pageCount}
              variant="ghost"
              size="sm"
              disabled={articles.page >= pageCount}
              className="gap-2 px-0 text-[#73798f]"
            >
              {articles.page < pageCount ? (
                <Link href={getNewsListPath(category.slug, articles.page + 1)} rel="next">
                  {t("next")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <span>{t("next")}</span>
              )}
            </Button>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
