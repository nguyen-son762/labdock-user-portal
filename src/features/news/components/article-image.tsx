import { Gallery } from "iconsax-reactjs";
import Image from "next/image";

import { getArticleImageUrl } from "../utils/article-image-url";

export function ArticleImage({
  thumbnailUrl,
  alt = "",
  priority = false,
  sizes,
}: {
  thumbnailUrl: string;
  alt?: string;
  priority?: boolean;
  sizes: string;
}) {
  const src = getArticleImageUrl(thumbnailUrl);
  return src ? (
    <Image src={src} alt={alt} fill priority={priority} sizes={sizes} unoptimized className="object-cover" />
  ) : (
    <div className="flex size-full min-h-40 items-center justify-center bg-muted" aria-hidden="true">
      <Gallery className="size-10 text-muted-foreground" />
    </div>
  );
}
