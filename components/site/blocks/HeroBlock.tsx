import type { HeroBlock as HeroContent } from "@/content/schema";
import { Media } from "../Media";
import { ContentAction } from "../ContentAction";

export function HeroBlock({ block }: { block: HeroContent }) {
  return <section className="content-hero">{block.image && <Media image={block.image} />}<h2>{block.title}</h2>{block.subtitle && <p>{block.subtitle}</p>}{block.actions?.map((action) => <ContentAction action={action} key={action.label} />)}</section>;
}
