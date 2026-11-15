import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createUuid } from "./uuid";

describe("createUuid", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("falls back to getRandomValues when randomUUID is unavailable (insecure context)", () => {
    vi.stubGlobal("crypto", { getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto) });

    const first = createUuid();
    const second = createUuid();

    expect(z.uuid().safeParse(first).success).toBe(true);
    expect(first).not.toBe(second);
  });

  it("uses randomUUID when available", () => {
    const randomUUID = vi.fn(() => "11111111-1111-4111-8111-111111111111");
    vi.stubGlobal("crypto", { randomUUID });
    expect(createUuid()).toBe("11111111-1111-4111-8111-111111111111");
  });
});
