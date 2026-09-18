import type { CtaBlock as CtaContent } from "@/content/schema";
import { ContentAction } from "../ContentAction";

export function CtaBlock({ block }: { block: CtaContent }) {
  return <section className="content-cta">{block.heading && <h2>{block.heading}</h2>}{block.description && <p>{block.description}</p>}<div className="button-row">{block.actions.map((action) => <ContentAction action={action} key={action.label} />)}</div></section>;
}
