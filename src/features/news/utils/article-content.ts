import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

import { getArticleImageUrl } from "./article-image-url";

const { window } = new JSDOM("");
const purifier = createDOMPurify(window);
const allowedTags = [
  "p",
  "br",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "hr",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
  "div",
  "sub",
  "sup",
];

export function sanitizeArticleContent(content: string): string {
  // Parse in an inert document, normalize CMS media, then sanitize the final markup.
  const document = window.document.implementation.createHTMLDocument("");
  document.body.innerHTML = content;
  for (const node of document.querySelectorAll("[style]")) {
    const alignment = node instanceof window.HTMLElement ? node.style.textAlign : "";
    node.removeAttribute("style");
    if (/^(left|center|right|justify)$/.test(alignment)) node.setAttribute("style", `text-align:${alignment}`);
  }
  for (const image of document.querySelectorAll("img")) {
    const src = getArticleImageUrl(image.getAttribute("src") ?? "");
    if (src) image.setAttribute("src", src);
    else image.removeAttribute("src");
    image.setAttribute("loading", "lazy");
  }
  return purifier.sanitize(document.body.innerHTML, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ["href", "title", "src", "alt", "width", "height", "loading", "colspan", "rowspan", "style"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}

export function getArticleDescription(content: string): string {
  const fragment = purifier.sanitize(content.replace(/<\/(p|h[1-6]|div|li)>/gi, "</$1> "), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    RETURN_DOM_FRAGMENT: true,
  });
  return (fragment.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
}
