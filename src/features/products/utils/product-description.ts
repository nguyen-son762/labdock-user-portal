import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const { window } = new JSDOM("");
const purifier = createDOMPurify(window);

export function sanitizeProductDescription(description: string): string {
  return purifier.sanitize(description, {
    ALLOWED_TAGS: [
      "a",
      "b",
      "blockquote",
      "br",
      "code",
      "div",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "i",
      "li",
      "ol",
      "p",
      "pre",
      "s",
      "strong",
      "sub",
      "sup",
      "u",
      "ul",
    ],
    ALLOWED_ATTR: ["href", "title"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}
