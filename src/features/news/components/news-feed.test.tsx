import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { articleCategory, articlesPage } from "../test/article-fixtures";
import { NewsFeed } from "./news-feed";

describe("NewsFeed", () => {
  it("uses API category names and resets page when changing categories", () => {
    renderWithProviders(
      <NewsFeed
        categories={[articleCategory, { ...articleCategory, id: "other", name: "Science", slug: "science" }]}
        category={articleCategory}
        articles={{ ...articlesPage, page: 2 }}
      />,
    );
    expect(screen.getByRole("link", { name: "Science" })).toHaveAttribute("href", "/news?category=science");
    expect(screen.getByRole("link", { name: "Research updates" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Go to page 3" })).toHaveAttribute(
      "href",
      "/news?category=research-updates&page=3",
    );
    expect(screen.getByRole("link", { name: /New laboratory research/ })).toHaveAttribute(
      "href",
      "/news/research-updates/new-laboratory-research",
    );
  });

  it("renders an empty state without fake articles", () => {
    renderWithProviders(<NewsFeed categories={[]} articles={{ items: [], page: 1, pageSize: 4, total: 0 }} />);
    expect(screen.getByText("No articles in this category yet.")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "News pagination" })).not.toBeInTheDocument();
  });
});
