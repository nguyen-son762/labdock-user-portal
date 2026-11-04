import { beforeEach, describe, expect, it, vi } from "vitest";

import { authTokenStore } from "@/lib/auth-token-store";

import { checkoutSessionFixture as session } from "../test/checkout-session.fixture";
import { checkoutSessionStorage } from "./checkout-session-storage";

beforeEach(() => {
  window.sessionStorage.clear();
  authTokenStore.clear();
});

describe("checkout session persistence", () => {
  it("restores instructions only for the matching order", () => {
    checkoutSessionStorage.set(session);
    expect(checkoutSessionStorage.get(session.orderId)).toEqual(session);
    expect(checkoutSessionStorage.get("22222222-2222-2222-2222-222222222222")).toBeNull();
  });

  it.each([
    "invalid-json",
    JSON.stringify({ ...session, qrImageUrl: "javascript:alert(1)" }),
    JSON.stringify({ ...session, orderId: "22222222-2222-2222-2222-222222222222" }),
  ])("ignores corrupted, unsafe, or mismatched persisted instructions", (stored) => {
    checkoutSessionStorage.set(session);
    const key = Object.keys(window.sessionStorage)[0]!;
    window.sessionStorage.setItem(key, stored);
    expect(checkoutSessionStorage.get(session.orderId)).toBeNull();
  });

  it("clears private payment instructions on logout without removing other storage", () => {
    authTokenStore.set({
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      mustChangePassword: false,
    });
    checkoutSessionStorage.set(session);
    window.sessionStorage.setItem("unrelated", "keep");
    authTokenStore.clear();
    expect(checkoutSessionStorage.get(session.orderId)).toBeNull();
    expect(window.sessionStorage.getItem("unrelated")).toBe("keep");
  });

  it("allows checkout to continue when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Blocked");
    });
    expect(() => checkoutSessionStorage.set(session)).not.toThrow();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Blocked");
    });
    expect(checkoutSessionStorage.get(session.orderId)).toBeNull();
  });

  it("keeps instructions across token refresh and removes them when logging into another account", () => {
    const tokens = {
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      mustChangePassword: false,
    };
    authTokenStore.set(tokens);
    checkoutSessionStorage.set(session);
    authTokenStore.set({ ...tokens, accessToken: "refreshed-token" }, { preserveSession: true });
    expect(checkoutSessionStorage.get(session.orderId)).toEqual(session);
    authTokenStore.set({ ...tokens, accessToken: "another-account-token" });
    expect(checkoutSessionStorage.get(session.orderId)).toBeNull();
  });
});
