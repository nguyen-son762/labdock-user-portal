import { useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";

import type { ArticleCategory, ArticleListItem } from "../schemas/news.schema";
import { formatNewsDate } from "../utils/news-formatters";
import { getArticlePath } from "../utils/news-paths";
import { ArticleImage } from "./article-image";
import { NewsCategoryBadge } from "./news-category-badge";

export function NewsArticleRow({ article, category }: { article: ArticleListItem; category: ArticleCategory }) {
  const locale = useLocale();
  return (
    <article className="border-b border-[#e9eaeb] py-4 last:border-b-0">
      <Link
        href={getArticlePath(category.slug, article.slug)}
        className="group grid gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990] sm:grid-cols-[minmax(180px,265px)_1fr] sm:items-center"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl sm:h-[199px] sm:aspect-auto">
          <ArticleImage thumbnailUrl={article.thumbnailUrl} sizes="(min-width: 640px) 265px, 100vw" />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <NewsCategoryBadge category={category.name} />
            <time dateTime={article.startDate} className="text-sm font-medium text-[#73798f]">
              {formatNewsDate(article.startDate, locale)}
            </time>
          </div>
          <h3 className="text-base font-bold leading-6 text-[#1f5fa8] transition-colors group-hover:text-[#0f3678]">
            {article.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
