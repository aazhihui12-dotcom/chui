"use client";

import { useId, useState, type ReactNode } from "react";

export function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return <section className="faq-item">
    <h2><button type="button" id={`${id}-question`} aria-expanded={open} aria-controls={`${id}-answer`} onClick={() => setOpen(!open)}>{title}<span aria-hidden="true">{open ? "−" : "+"}</span></button></h2>
    <div id={`${id}-answer`} role="region" aria-labelledby={`${id}-question`} hidden={!open}>{children}</div>
  </section>;
}
