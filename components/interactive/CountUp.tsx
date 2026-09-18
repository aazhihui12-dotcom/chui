"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const element = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const target = Number.parseInt(value.replace(/,/g, ""), 10);
    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!Number.isFinite(target) || motion?.matches || !window.IntersectionObserver) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1000, 1);
        setDisplay(progress === 1 ? value : value.replace(/[\d,]+/, String(Math.round(target * (1 - (1 - progress) ** 3)))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (element.current) observer.observe(element.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={element} aria-label={value}><span aria-hidden="true">{display}</span></span>;
}
