import { ArrowLeft2 } from "iconsax-reactjs";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import type { ArticleDetail } from "../schemas/news.schema";
import { sanitizeArticleContent } from "../utils/article-content";
import { formatNewsDate } from "../utils/news-formatters";
import { getNewsListPath } from "../utils/news-paths";
import { ArticleImage } from "./article-image";
import { CopyLinkButton } from "./copy-link-button";
import { NewsCategoryBadge } from "./news-category-badge";

export function NewsDetailScreen({ article }: { article: ArticleDetail }) {
  const t = useTranslations("News");
  const locale = useLocale();
  return (
    <article className="bg-[#f5f8fb] pb-16">
      <header className="mx-auto max-w-[1240px] px-5 pb-[50px] pt-8 sm:px-10 xl:px-0">
        <Link
          href={getNewsListPath(article.categorySlug)}
          className="inline-flex items-center gap-2 rounded text-sm text-[#1f5fa8] hover:text-[#0f3678] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
        >
          <ArrowLeft2 className="size-5" aria-hidden="true" /> {t("back")}
        </Link>
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <NewsCategoryBadge category={article.categoryName} compact />
            <time dateTime={article.startDate} className="text-sm font-semibold text-[#73798f]">
              {formatNewsDate(article.startDate, locale)}
            </time>
          </div>
          <h1 className="text-[32px] font-semibold leading-[1.15] text-[#0f3678]">{article.title}</h1>
        </div>
        <div className="relative mt-6 aspect-[2/1] min-h-[300px] overflow-hidden rounded-[20px] lg:h-[620px] lg:aspect-auto">
          <ArticleImage
            thumbnailUrl={article.thumbnailUrl}
            alt={article.title}
            priority
            sizes="(min-width: 1280px) 1240px, 100vw"
          />
        </div>
      </header>
      <div className="mx-auto max-w-[824px] space-y-8 px-5 sm:px-10 lg:px-0">
        <div
          className="break-words whitespace-pre-line text-base leading-7 text-[#5e6375] [&_a]:text-[#1f5fa8] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h2]:my-5 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:my-4 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:h-auto [&_img]:max-w-full [&_li]:ml-6 [&_ol]:list-decimal [&_p]:my-3 [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(article.content) }}
        />
        <div className="flex items-center justify-between border-t border-[#dde2e8] pt-5">
          <p className="text-sm text-[#051a50]">{t("share")}</p>
          <CopyLinkButton />
        </div>
      </div>
    </article>
  );
}
