import { clientEnv } from "@/config/client-env";

export function getArticleImageUrl(thumbnailUrl: string): string | null {
  if (!thumbnailUrl.trim()) return null;
  try {
    const apiOrigin = clientEnv.NEXT_PUBLIC_API_BASE_URL.startsWith("/")
      ? "https://local.invalid"
      : new URL(clientEnv.NEXT_PUBLIC_API_BASE_URL).origin;
    const url = new URL(thumbnailUrl, `${apiOrigin}/`);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    return apiOrigin === "https://local.invalid" && url.origin === apiOrigin
      ? `${url.pathname}${url.search}`
      : url.toString();
  } catch {
    return null;
  }
}
