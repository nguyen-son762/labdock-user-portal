import { z } from "zod";

import { clientEnv } from "@/config/client-env";

/** Turns an API media path such as `/media/public/x.png` into a URL served by the API host. */
export function resolveApiMediaUrl(mediaUrl: string): string {
  if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;

  const relativePath = mediaUrl.replace(/^\/+/, "");
  if (!relativePath.startsWith("media/") && !relativePath.startsWith("public/")) {
    return mediaUrl.startsWith("/") ? mediaUrl : `/${mediaUrl}`;
  }

  const assetPath = relativePath.startsWith("public/") ? `media/${relativePath}` : relativePath;
  if (clientEnv.NEXT_PUBLIC_API_BASE_URL.startsWith("/")) return `/${assetPath}`;

  return new URL(assetPath, `${new URL(clientEnv.NEXT_PUBLIC_API_BASE_URL).origin}/`).toString();
}

/** Optional API image: an absolute http(s) URL or an API media path; empty or missing becomes "". */
export const apiImageUrlSchema = z
  .union([
    z.literal(""),
    z.url({ protocol: /^https?$/ }),
    z
      .string()
      .trim()
      .regex(/^\/(?!\/)\S+$/),
  ])
  .nullish()
  .transform((value) => (value ? resolveApiMediaUrl(value) : ""));
