import { act, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authTokenStore } from "@/lib/auth-token-store";
import { AuthTokenRefreshSync } from "./auth-token-refresh-sync";

const router = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const tokens = {
  accessToken: "old-access-token",
  refreshToken: "refresh-token",
  expiresAt: "2099-08-21T12:00:00+00:00",
  mustChangePassword: false,
};

beforeEach(() => router.refresh.mockReset());
afterEach(() => authTokenStore.clear());

describe("server rendering after token refresh", () => {
  it("refreshes the route once after the new token cookie has been persisted", () => {
    authTokenStore.set(tokens);
    render(
      <StrictMode>
        <AuthTokenRefreshSync />
      </StrictMode>,
    );
    router.refresh.mockImplementation(() => {
      expect(document.cookie).toContain("labdock_access_token=new-access-token");
      expect(authTokenStore.getAccessToken()).toBe("new-access-token");
    });

    act(() => {
      authTokenStore.set({ ...tokens, accessToken: "new-access-token" }, { preserveSession: true });
    });

    expect(router.refresh).toHaveBeenCalledExactlyOnceWith();
  });

  it("does not refresh the server on mount, login, or a session clear", () => {
    render(<AuthTokenRefreshSync />);
    act(() => {
      authTokenStore.set(tokens);
      authTokenStore.clear();
    });
    expect(router.refresh).not.toHaveBeenCalled();
  });

  it("unsubscribes when unmounted", () => {
    const { unmount } = render(<AuthTokenRefreshSync />);
    unmount();
    authTokenStore.set(tokens, { preserveSession: true });
    expect(router.refresh).not.toHaveBeenCalled();
  });

  it("does not refresh the route for malformed token responses", () => {
    render(<AuthTokenRefreshSync />);
    expect(() => authTokenStore.set({ ...tokens, accessToken: "" }, { preserveSession: true })).toThrow();
    expect(router.refresh).not.toHaveBeenCalled();
  });
});
