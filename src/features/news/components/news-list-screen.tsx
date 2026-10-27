import type { ArticleCategory, ArticlesPage } from "../schemas/news.schema";
import { FeaturedArticle } from "./featured-article";
import { NewsFeed } from "./news-feed";
import { NewsHero } from "./news-hero";
import { NewsSidebar } from "./news-sidebar";

export function NewsListScreen({
  categories,
  category,
  articles,
}: {
  categories: ArticleCategory[];
  category?: ArticleCategory;
  articles: ArticlesPage;
}) {
  const featuredArticle = articles.page === 1 ? articles.items[0] : undefined;
  return (
    <div className="bg-[#f5f8fb]">
      <NewsHero />
      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-8 sm:px-10 lg:grid-cols-[minmax(0,820px)_minmax(320px,404px)] lg:gap-4 xl:px-0">
        <div className="space-y-12">
          {featuredArticle && category ? <FeaturedArticle article={featuredArticle} category={category} /> : null}
          <NewsFeed categories={categories} category={category} articles={articles} />
        </div>
        <NewsSidebar />
      </div>
    </div>
  );
}
