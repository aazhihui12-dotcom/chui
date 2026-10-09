import { sitePath } from "@/lib/site-path";
import type { ImageAsset } from "@/content/schema";

export function Media({ image, className, priority = false }: { image: ImageAsset; className?: string; priority?: boolean }) {
  return <img src={sitePath(image.src)} alt={image.alt} width={image.width ?? 1200} height={image.height ?? 800} className={className} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : undefined} />;
}
