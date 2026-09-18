import type { GalleryBlock as GalleryContent } from "@/content/schema";
import { Media } from "../Media";

export function GalleryBlock({ block }: { block: GalleryContent }) {
  return <section className="content-gallery">{block.heading && <h2>{block.heading}</h2>}<div>{block.images.map((image, index) => <Media key={`${image.src}-${index}`} image={image} />)}</div></section>;
}
