import { afterEach, describe, expect, it, vi } from "vitest";

import { authTokenStore } from "./auth-token-store";

const tokens = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresAt: "2099-08-21T12:00:00+00:00",
  mustChangePassword: false,
};

describe("authTokenStore", () => {
  afterEach(() => authTokenStore.clear());

  it("keeps tokens in session cookies and only exposes non-secret session metadata", () => {
    authTokenStore.set(tokens);

    expect(authTokenStore.getAccessToken()).toBe(tokens.accessToken);
    expect(authTokenStore.getRefreshToken()).toBe(tokens.refreshToken);
    expect(authTokenStore.getSessionMetadata()).toEqual({
      expiresAt: tokens.expiresAt,
      mustChangePassword: false,
    });
    expect(document.cookie).toContain("labdock_access_token=access-token");
    expect(document.cookie).toContain("labdock_refresh_token=refresh-token");
  });

  it("restores tokens from cookies after the in-memory module state is recreated", async () => {
    authTokenStore.set(tokens);
    vi.resetModules();

    const { authTokenStore: restoredStore } = await import("./auth-token-store");

    expect(restoredStore.getAccessToken()).toBe(tokens.accessToken);
    expect(restoredStore.getRefreshToken()).toBe(tokens.refreshToken);
    expect(restoredStore.getSessionMetadata()).toEqual({
      expiresAt: tokens.expiresAt,
      mustChangePassword: false,
    });
  });

  it("rejects malformed token responses", () => {
    expect(() => authTokenStore.set({ ...tokens, expiresAt: "invalid" })).toThrow();
    expect(authTokenStore.getSessionMetadata()).toBeNull();
  });

  it("notifies subscribers when an active session is cleared", () => {
    const listener = vi.fn();
    const unsubscribe = authTokenStore.onClear(listener);
    authTokenStore.set(tokens);

    authTokenStore.clear();
    authTokenStore.clear();
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("notifies session changes for login and logout while preserving data across token refresh", () => {
    const listener = vi.fn();
    const unsubscribe = authTokenStore.onSessionChange(listener);
    try {
      authTokenStore.set(tokens);
      expect(listener).toHaveBeenCalledTimes(1);
      authTokenStore.set({ ...tokens, accessToken: "refreshed-token" }, { preserveSession: true });
      expect(listener).toHaveBeenCalledTimes(1);
      authTokenStore.set({ ...tokens, accessToken: "another-account-token" });
      expect(listener).toHaveBeenCalledTimes(2);
      authTokenStore.clear();
      expect(listener).toHaveBeenCalledTimes(3);
      authTokenStore.clear();
      expect(listener).toHaveBeenCalledTimes(3);
    } finally {
      unsubscribe();
    }
    authTokenStore.set(tokens);
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
