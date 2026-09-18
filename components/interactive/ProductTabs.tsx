"use client";

import { useId, useRef, useState, type ReactNode } from "react";

export function ProductTabs({ labels, children }: { labels: string[]; children: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  return <section className="product-tabs">
    <div role="tablist" aria-label={labels.join(" / ")} className="product-tabs__list">
      {labels.map((label, index) => <button key={label} ref={(node) => { buttons.current[index] = node; }} role="tab" id={`${id}-tab-${index}`} aria-selected={index === active} aria-controls={`${id}-panel-${index}`} tabIndex={index === active ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => {
        const next = event.key === "ArrowRight" ? (index + 1) % labels.length : event.key === "ArrowLeft" ? (index - 1 + labels.length) % labels.length : event.key === "Home" ? 0 : event.key === "End" ? labels.length - 1 : undefined;
        if (next === undefined) return;
        event.preventDefault(); setActive(next); buttons.current[next]?.focus();
      }}>{label}</button>)}
    </div>
    {children.map((child, index) => <div key={index} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={active !== index} tabIndex={0} className="product-tabs__panel">{child}</div>)}
  </section>;
}
