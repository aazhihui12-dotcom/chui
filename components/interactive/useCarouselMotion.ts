"use client";
import { useEffect, useRef, useState, type HTMLAttributes } from "react";

/** Autoplay is opt-in from captured source settings; direct manipulation stops it. */
export function useCarouselMotion(change: (direction: number) => void, autoplayMs = 0) {
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query?.matches ?? false);
    update(); query?.addEventListener("change", update);
    return () => query?.removeEventListener("change", update);
  }, []);
  const playing = Boolean(autoplayMs && !paused && !hovered && !focused && !reduced);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => change(1), autoplayMs);
    return () => window.clearInterval(timer);
  }, [playing, autoplayMs, change]);
  const interaction = () => setPaused(true);
  const bindings: HTMLAttributes<HTMLElement> = {
    style: { touchAction: "pan-y" },
    onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false),
    onFocusCapture: () => setFocused(true),
    onBlurCapture: event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); },
    onPointerDown: event => { if (event.button !== 0) return; start.current = { x: event.clientX, y: event.clientY }; swiped.current = false; },
    onPointerUp: event => {
      if (!start.current) return;
      const dx = event.clientX - start.current.x, dy = event.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped.current = true; interaction(); change(dx < 0 ? 1 : -1); }
    },
    onPointerCancel: () => { start.current = null; },
    onClickCapture: event => { if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; } },
    onDragStart: event => event.preventDefault(),
  };
  return { bindings, paused, reduced, playing, interaction, toggle: () => setPaused(value => !value) };
}
