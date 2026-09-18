import type { CtaBlock as CtaContent } from "@/content/schema";

export function CtaBlock({ block }: { block: CtaContent }) {
  return <section className="content-cta">{block.heading && <h2>{block.heading}</h2>}{block.description && <p>{block.description}</p>}<div className="button-row">{block.actions.map((action) => <a className="lbh-button" href={action.href} key={action.label}>{action.label}<span aria-hidden="true"> ↗</span></a>)}</div></section>;
}
