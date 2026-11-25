import { describe, expect, it } from "vitest";

import { apiImageUrlSchema } from "./media-url";

describe("apiImageUrlSchema", () => {
  it("resolves API media paths against the API host", () => {
    const url = apiImageUrlSchema.parse("/media/public/payments/qr.png");
    expect(url).toMatch(/^https?:\/\/[^/]+\/media\/public\/payments\/qr\.png$/);
    expect(url).not.toContain("/api/public/v1");
  });

  it.each([
    ["https://cdn.example/qr.png", "https://cdn.example/qr.png"],
    ["", ""],
    [null, ""],
    [undefined, ""],
  ])("keeps absolute URLs and treats %s as no image", (input, expected) => {
    expect(apiImageUrlSchema.parse(input)).toBe(expected);
  });

  it.each(["javascript:alert(1)", "//evil.example/qr.png", "ftp://cdn.example/qr.png"])("rejects %s", (input) => {
    expect(apiImageUrlSchema.safeParse(input).success).toBe(false);
  });
});
