import type { StatsBlock as StatsContent } from "@/content/schema";
import { CountUp } from "@/components/interactive/CountUp";

export function StatsBlock({ block }: { block: StatsContent }) {
  return <dl className="stats-grid">{block.items.map((item, index) => <div key={index}><dt>{item.label}</dt><dd><CountUp value={item.value} /></dd></div>)}</dl>;
}
