import type { TimelineBlock as TimelineContent } from "@/content/schema";

export function TimelineBlock({ block }: { block: TimelineContent }) {
  return <ol className="content-timeline">{block.items.map((item, index) => <li key={`${item.year}-${index}`}><span>{item.year}</span><h2>{item.title}</h2><p>{item.description}</p></li>)}</ol>;
}
