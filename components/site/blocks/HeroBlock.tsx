import type { HeroBlock as HeroContent } from "@/content/schema";
import { Media } from "../Media";

export function HeroBlock({ block }: { block: HeroContent }) {
  return <section className="content-hero">{block.image && <Media image={block.image} />}<h2>{block.title}</h2>{block.subtitle && <p>{block.subtitle}</p>}{block.actions?.map((action) => <a className="lbh-button" href={action.href} key={action.label}>{action.label}</a>)}</section>;
}
