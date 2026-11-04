import { z } from "zod";

import { AUTH_COOKIE_NAMES } from "./auth-cookie-names";

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }),
  mustChangePassword: z.boolean(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;

let tokens: AuthTokens | null = null;
let sessionVersion = 0;
const clearListeners = new Set<() => void>();
const refreshListeners = new Set<() => void>();
const sessionChangeListeners = new Set<() => void>();

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const value = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length);
  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`;
}

function removeCookie(name: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

function persistTokens(value: AuthTokens): void {
  writeCookie(AUTH_COOKIE_NAMES.accessToken, value.accessToken);
  writeCookie(AUTH_COOKIE_NAMES.refreshToken, value.refreshToken);
  writeCookie(AUTH_COOKIE_NAMES.expiresAt, value.expiresAt);
  writeCookie(AUTH_COOKIE_NAMES.mustChangePassword, String(value.mustChangePassword));
}

function clearPersistedTokens(): void {
  Object.values(AUTH_COOKIE_NAMES).forEach(removeCookie);
}

function restoreTokens(): AuthTokens | null {
  if (tokens) return tokens;

  const persisted = {
    accessToken: readCookie(AUTH_COOKIE_NAMES.accessToken),
    refreshToken: readCookie(AUTH_COOKIE_NAMES.refreshToken),
    expiresAt: readCookie(AUTH_COOKIE_NAMES.expiresAt),
    mustChangePassword: readCookie(AUTH_COOKIE_NAMES.mustChangePassword),
  };
  if (Object.values(persisted).every((value) => value === null)) return null;

  const persistedMustChangePassword =
    persisted.mustChangePassword === "true" ? true : persisted.mustChangePassword === "false" ? false : null;

  const parsed = authTokensSchema.safeParse({
    accessToken: persisted.accessToken,
    refreshToken: persisted.refreshToken,
    expiresAt: persisted.expiresAt,
    mustChangePassword: persistedMustChangePassword,
  });
  if (!parsed.success) {
    clearPersistedTokens();
    return null;
  }

  tokens = parsed.data;
  return tokens;
}

export const authTokenStore = {
  set(input: unknown, options: { preserveSession?: boolean } = {}): AuthTokens {
    tokens = authTokensSchema.parse(input);
    if (!options.preserveSession) sessionVersion += 1;
    persistTokens(tokens);
    if (options.preserveSession) refreshListeners.forEach((listener) => listener());
    else sessionChangeListeners.forEach((listener) => listener());
    return tokens;
  },

  clear(): void {
    const hadTokens = tokens !== null || Object.values(AUTH_COOKIE_NAMES).some((name) => readCookie(name) !== null);
    tokens = null;
    sessionVersion += 1;
    clearPersistedTokens();
    if (hadTokens) {
      clearListeners.forEach((listener) => listener());
      sessionChangeListeners.forEach((listener) => listener());
    }
  },

  getAccessToken(): string | null {
    return restoreTokens()?.accessToken ?? null;
  },

  getSessionVersion(): number {
    return sessionVersion;
  },

  getRefreshToken(): string | null {
    return restoreTokens()?.refreshToken ?? null;
  },

  getSessionMetadata(): Pick<AuthTokens, "expiresAt" | "mustChangePassword"> | null {
    const restoredTokens = restoreTokens();
    if (!restoredTokens) return null;
    return { expiresAt: restoredTokens.expiresAt, mustChangePassword: restoredTokens.mustChangePassword };
  },

  onClear(listener: () => void): () => void {
    clearListeners.add(listener);
    return () => clearListeners.delete(listener);
  },

  onRefresh(listener: () => void): () => void {
    refreshListeners.add(listener);
    return () => refreshListeners.delete(listener);
  },

  onSessionChange(listener: () => void): () => void {
    sessionChangeListeners.add(listener);
    return () => sessionChangeListeners.delete(listener);
  },
};
