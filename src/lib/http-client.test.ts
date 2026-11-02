import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { authTokenStore } from "./auth-token-store";
import { httpClient } from "./http-client";

const initialTokens = {
  accessToken: "initial-access-token",
  refreshToken: "initial-refresh-token",
  expiresAt: "2099-08-21T12:00:00+00:00",
  mustChangePassword: false,
};

const refreshedTokens = {
  ...initialTokens,
  accessToken: "refreshed-access-token",
  refreshToken: "refreshed-refresh-token",
};

const originalAdapter = httpClient.defaults.adapter;

function createResponse<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return { data, status, statusText: status === 200 ? "OK" : "Unauthorized", headers: new AxiosHeaders(), config };
}

function unauthorized(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError("Unauthorized", AxiosError.ERR_BAD_REQUEST, config, undefined, createResponse(config, {}, 401));
}

describe("httpClient authentication", () => {
  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter;
    authTokenStore.clear();
  });

  it("adds the Bearer access token to requests", async () => {
    authTokenStore.set(initialTokens);
    let authorization: string | undefined;
    httpClient.defaults.adapter = (async (config) => {
      authorization = config.headers.get("Authorization")?.toString();
      return createResponse(config, { ok: true });
    }) satisfies AxiosAdapter;

    await httpClient.get("/protected");

    expect(authorization).toBe("Bearer initial-access-token");
  });

  it("does not send an access token to public category, signup and password reset endpoints", async () => {
    authTokenStore.set(initialTokens);
    const authorizations: Array<string | undefined> = [];
    httpClient.defaults.adapter = (async (config) => {
      authorizations.push(config.headers.get("Authorization")?.toString());
      return createResponse(config, { ok: true });
    }) satisfies AxiosAdapter;

    await httpClient.get("/categories");
    await httpClient.post("/auth/signup/start", {});
    await httpClient.post("/auth/forgot-password/start", {});

    expect(authorizations).toEqual([undefined, undefined, undefined]);
  });

  it("refreshes once for concurrent 401 responses and retries with the new access token", async () => {
    authTokenStore.set(initialTokens);
    const refreshListener = vi.fn();
    const unsubscribe = authTokenStore.onRefresh(refreshListener);
    let protectedCalls = 0;
    let refreshCalls = 0;
    const retriedAuthorizations: string[] = [];

    httpClient.defaults.adapter = (async (config) => {
      if (config.url === "/auth/refresh") {
        refreshCalls += 1;
        expect(typeof config.data).toBe("string");
        if (typeof config.data === "string") {
          expect(JSON.parse(config.data)).toEqual({ refreshToken: initialTokens.refreshToken });
        }
        return createResponse(config, refreshedTokens);
      }

      protectedCalls += 1;
      if (protectedCalls <= 2) throw unauthorized(config);
      retriedAuthorizations.push(config.headers.get("Authorization")?.toString() ?? "");
      return createResponse(config, { ok: true });
    }) satisfies AxiosAdapter;

    try {
      await Promise.all([httpClient.get("/protected/one"), httpClient.get("/protected/two")]);
    } finally {
      unsubscribe();
    }

    expect(refreshCalls).toBe(1);
    expect(retriedAuthorizations).toEqual(["Bearer refreshed-access-token", "Bearer refreshed-access-token"]);
    expect(authTokenStore.getRefreshToken()).toBe(refreshedTokens.refreshToken);
    expect(refreshListener).toHaveBeenCalledExactlyOnceWith();
  });

  it("clears tokens when refresh fails", async () => {
    authTokenStore.set(initialTokens);
    const refreshListener = vi.fn();
    const unsubscribe = authTokenStore.onRefresh(refreshListener);
    httpClient.defaults.adapter = (async (config) => {
      throw unauthorized(config);
    }) satisfies AxiosAdapter;

    try {
      await expect(httpClient.get("/protected")).rejects.toSatisfy(axios.isAxiosError);
    } finally {
      unsubscribe();
    }

    expect(authTokenStore.getAccessToken()).toBeNull();
    expect(authTokenStore.getRefreshToken()).toBeNull();
    expect(refreshListener).not.toHaveBeenCalled();
  });

  it("SYS-006 does not restore a session when refresh finishes after logout", async () => {
    authTokenStore.set(initialTokens);
    let finishRefresh: (() => void) | undefined;
    const started = vi.fn();
    httpClient.defaults.adapter = (async (config) => {
      if (config.url === "/auth/refresh") {
        started();
        await new Promise<void>((resolve) => {
          finishRefresh = resolve;
        });
        return createResponse(config, refreshedTokens);
      }
      if (config.headers.get("Authorization") === `Bearer ${initialTokens.accessToken}`) throw unauthorized(config);
      return createResponse(config, {});
    }) satisfies AxiosAdapter;
    const request = httpClient.get("/protected").catch((error: unknown) => error);
    await vi.waitFor(() => expect(started).toHaveBeenCalledOnce());
    authTokenStore.clear();
    finishRefresh?.();
    await request;
    expect(authTokenStore.getAccessToken()).toBeNull();
  });

  it("SYS-015 rejects a response from the previous user after account switching", async () => {
    authTokenStore.set(initialTokens);
    let finishRequest: (() => void) | undefined;
    const started = vi.fn();
    httpClient.defaults.adapter = (async (config) => {
      started();
      await new Promise<void>((resolve) => {
        finishRequest = resolve;
      });
      return createResponse(config, { private: "user A" });
    }) satisfies AxiosAdapter;
    const request = httpClient.get("/me/profile").then(
      () => "accepted",
      () => "rejected",
    );
    await vi.waitFor(() => expect(started).toHaveBeenCalledOnce());
    authTokenStore.clear();
    authTokenStore.set({ ...initialTokens, accessToken: "user-B" });
    finishRequest?.();
    expect(await request).toBe("rejected");
  });
  it("SYS-004 stops after a single refresh when the retried request still returns 401", async () => {
    authTokenStore.set(initialTokens);
    let refreshCalls = 0;
    httpClient.defaults.adapter = (async (config) => {
      if (config.url === "/auth/refresh") {
        refreshCalls += 1;
        return createResponse(config, refreshedTokens);
      }
      throw unauthorized(config);
    }) satisfies AxiosAdapter;
    await expect(httpClient.get("/protected")).rejects.toSatisfy(axios.isAxiosError);
    expect(refreshCalls).toBe(1);
    expect(authTokenStore.getAccessToken()).toBeNull();
  });

  it("SYS-005 keeps the active session after a public category 401", async () => {
    authTokenStore.set(initialTokens);
    const paths: string[] = [];
    httpClient.defaults.adapter = (async (config) => {
      paths.push(config.url ?? "");
      throw unauthorized(config);
    }) satisfies AxiosAdapter;
    await expect(httpClient.get("/categories")).rejects.toSatisfy(axios.isAxiosError);
    expect(paths).toEqual(["/categories"]);
    expect(authTokenStore.getAccessToken()).toBe(initialTokens.accessToken);
  });
});
