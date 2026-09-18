import type { SplitBlock as SplitContent } from "@/content/schema";
import { Media } from "../Media";

export function SplitBlock({ block }: { block: SplitContent }) {
  return <section className={`content-split content-split--${block.imagePosition ?? "right"}`}><div><h2>{block.heading}</h2>{block.paragraphs.map((text, index) => <p key={index}>{text}</p>)}{block.actions?.map((action) => <a className="lbh-button" key={action.label} href={action.href}>{action.label}</a>)}</div><Media image={block.image} /></section>;
}
