import { describe, expect, it } from "vitest";

import { getArticleDescription, sanitizeArticleContent } from "./article-content";
import { getArticleImageUrl } from "./article-image-url";
import { getArticlePath, parseNewsPage } from "./news-paths";

describe("article content", () => {
  it("keeps rich text while removing scripts, event handlers, embeds and unsafe URLs", () => {
    const html = sanitizeArticleContent(
      '<h2>Research</h2><p style="text-align:center;color:red">Text</p><script>alert(1)</script><a href="javascript:alert(1)">Bad</a><img src="/media/public/figure.jpg" onerror="alert(1)"><iframe src="https://example.com"></iframe>',
    );
    expect(html).toContain("<h2>Research</h2>");
    expect(html).toContain('style="text-align:center"');
    expect(html).toContain('src="https://uat-api-labdock.365studio.vn/media/public/figure.jpg"');
    expect(html).not.toMatch(/script|onerror|javascript:|iframe|color:red/);
  });
  it("extracts text for metadata and treats plain text safely", () => {
    expect(getArticleDescription("<p>Research &amp; development</p><script>secret</script>")).toBe(
      "Research & development",
    );
    expect(sanitizeArticleContent("Plain article\nNext line")).toBe("Plain article\nNext line");
  });
  it("rejects unsafe image schemes and resolves API media paths", () => {
    expect(getArticleImageUrl("javascript:alert(1)")).toBeNull();
    expect(getArticleImageUrl("")).toBeNull();
    expect(getArticleImageUrl("/media/a.jpg")).toBe("https://uat-api-labdock.365studio.vn/media/a.jpg");
    expect(getArticleImageUrl("https://cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
  });
  it("encodes article URL segments and validates page parameters", () => {
    expect(getArticlePath("a/b", "c d")).toBe("/news/a%2Fb/c%20d");
    expect(parseNewsPage("2")).toBe(2);
    for (const value of ["-1", "1.5", "Infinity", "9007199254740993", ["2", "3"], undefined])
      expect(parseNewsPage(value)).toBe(1);
  });
});
