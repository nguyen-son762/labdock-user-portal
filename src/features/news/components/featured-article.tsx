import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import type { ArticleCategory, ArticleListItem } from "../schemas/news.schema";
import { formatNewsDate } from "../utils/news-formatters";
import { getArticlePath } from "../utils/news-paths";
import { ArticleImage } from "./article-image";
import { NewsCategoryBadge } from "./news-category-badge";

export function FeaturedArticle({ article, category }: { article: ArticleListItem; category: ArticleCategory }) {
  const t = useTranslations("News");
  const locale = useLocale();
  return (
    <section aria-labelledby="top-highlight-heading">
      <h2 id="top-highlight-heading" className="text-[32px] font-semibold leading-none text-[#0f3678]">
        {t("highlight")}
      </h2>
      <div className="mt-4 rounded-xl bg-white p-3 md:px-4">
        <Link
          href={getArticlePath(category.slug, article.slug)}
          className="group grid gap-5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990] md:grid-cols-2 md:gap-4"
        >
          <div className="flex min-w-0 flex-col gap-4 py-1">
            <div className="flex flex-wrap items-center gap-3">
              <NewsCategoryBadge category={category.name} />
              <time dateTime={article.startDate} className="text-sm font-semibold text-[#73798f]">
                {formatNewsDate(article.startDate, locale)}
              </time>
            </div>
            <h3 className="text-[28px] font-semibold leading-[1.15] text-[#0f3678] transition-colors group-hover:text-[#1f5fa8] lg:text-[32px]">
              {article.title}
            </h3>
          </div>
          <div className="relative min-h-[240px] overflow-hidden rounded-xl md:h-[273px]">
            <ArticleImage
              thumbnailUrl={article.thumbnailUrl}
              alt={article.title}
              priority
              sizes="(min-width: 1024px) 386px, 100vw"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
