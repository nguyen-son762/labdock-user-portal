export const articleCategory = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Research updates",
  slug: "research-updates",
};

export const articleListItem = {
  id: "22222222-2222-2222-2222-222222222222",
  title: "New laboratory research",
  slug: "new-laboratory-research",
  startDate: "2026-08-21T10:00:00+00:00",
  endDate: "2026-09-21T10:00:00+00:00",
  thumbnailUrl: "/media/public/article.jpg",
};

export const articleDetail = {
  ...articleListItem,
  categoryId: articleCategory.id,
  categorySlug: articleCategory.slug,
  categoryName: articleCategory.name,
  content:
    '<h2>Research findings</h2><p>New laboratory methods.</p><img src="/media/public/figure.jpg" alt="Research figure">',
};

export const articlesPage = { items: [articleListItem], page: 1, pageSize: 4, total: 10 };
