import type { MediaBlock as MediaContent } from "@/content/schema";
import { Media } from "../Media";

export function MediaBlock({ block }: { block: MediaContent }) {
  return <figure className="content-media"><Media image={block.image} />{block.caption && <figcaption>{block.caption}</figcaption>}{block.videoUrl && <video aria-label={block.caption || block.image.alt || "Video"} controls preload="none" src={block.videoUrl} poster={block.image.src} />}</figure>;
}
