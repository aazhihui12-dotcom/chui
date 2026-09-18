import type { GalleryBlock as GalleryContent } from "@/content/schema";
import { Media } from "../Media";

export function GalleryBlock({ block }: { block: GalleryContent }) {
  if (block.presentation === "hover") return <figure className="content-gallery content-gallery--hover" tabIndex={0} aria-label={block.images[0].alt}><div>{block.images.map((image, index) => <Media key={image.src} image={{ ...image, alt: index ? "" : image.alt }} />)}</div></figure>;
  return <section className="content-gallery">{block.heading && <h2>{block.heading}</h2>}<div>{block.images.map((image, index) => <Media key={`${image.src}-${index}`} image={image} />)}</div></section>;
}
