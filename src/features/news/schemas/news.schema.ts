import { z } from "zod";

const identifierSchema = z.string().min(1);
const timestampSchema = z.iso.datetime({ offset: true });

export const articleCategorySchema = z.object({
  id: identifierSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const articleCategoriesSchema = z.array(articleCategorySchema);

export const articleListItemSchema = z.object({
  id: identifierSchema,
  title: z.string().min(1),
  slug: z.string().min(1),
  startDate: timestampSchema,
  endDate: timestampSchema,
  thumbnailUrl: z.string(),
});

export const articlesPageSchema = z.object({
  items: z.array(articleListItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const articleDetailSchema = articleListItemSchema.extend({
  categoryId: identifierSchema,
  categorySlug: z.string().min(1),
  categoryName: z.string().min(1),
  content: z.string(),
});

export type ArticleCategory = z.infer<typeof articleCategorySchema>;
export type ArticleListItem = z.infer<typeof articleListItemSchema>;
export type ArticlesPage = z.infer<typeof articlesPageSchema>;
export type ArticleDetail = z.infer<typeof articleDetailSchema>;
