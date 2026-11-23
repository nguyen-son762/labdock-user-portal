import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { AUTH_COOKIE_NAMES } from "./lib/auth-cookie-names";

const handleI18nRouting = createMiddleware(routing);

const GUEST_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];

function splitLocale(pathname: string): { localePrefix: string; path: string } {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if (maybeLocale && (routing.locales as readonly string[]).includes(maybeLocale)) {
    return { localePrefix: `/${maybeLocale}`, path: `/${rest.join("/")}` };
  }
  return { localePrefix: "", path: pathname };
}

function isGuestOnlyPath(path: string): boolean {
  return GUEST_ONLY_PATHS.some((guestPath) => path === guestPath || path.startsWith(`${guestPath}/`));
}

export default function middleware(request: NextRequest) {
  const { localePrefix, path } = splitLocale(request.nextUrl.pathname);
  const isAuthenticated = Boolean(request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value);

  if (isAuthenticated && isGuestOnlyPath(path)) {
    const url = request.nextUrl.clone();
    url.pathname = localePrefix || "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
