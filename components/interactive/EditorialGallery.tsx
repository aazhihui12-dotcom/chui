"use client";

import { useState } from "react";
import type { ImageAsset, Locale } from "@/content/schema";
import { Media } from "@/components/site/Media";
import { useCarouselMotion } from "./useCarouselMotion";

export function EditorialGallery({ images, label, locale, autoplayMs = 0 }: { images: ImageAsset[]; label: string; locale: Locale; autoplayMs?: number }) {
  const [active, setActive] = useState(0);
  const cn = locale === "cn";
  const change = (direction: number) => setActive((index) => (index + direction + images.length) % images.length);
  const motion = useCarouselMotion(change, images.length > 1 ? autoplayMs : 0);
  const manual = (direction: number) => { motion.interaction(); change(direction); };
  return <section {...motion.bindings} className="editorial-gallery" aria-label={label} aria-roledescription="carousel">
    {images.map((image, index) => <div key={image.src} hidden={index !== active} role="group" aria-roledescription="slide" aria-label={`${index + 1} / ${images.length}`}>
      <Media image={{ ...image, alt: `${label} ${index + 1}` }} />
    </div>)}
    <div className="editorial-gallery__controls">
      <button className="editorial-gallery__previous" aria-label={cn ? "上一张图片" : "Previous image"} onClick={() => manual(-1)}>←</button>
      <span className="sr-only" role="status" aria-live={motion.playing ? "off" : "polite"}>{active + 1} / {images.length}</span>
      {images.map((image, index) => <button className="editorial-gallery__dot" key={image.src} aria-label={cn ? `查看第${index + 1}张图片` : `Go to image ${index + 1}`} aria-current={index === active ? "true" : undefined} onClick={() => { motion.interaction(); setActive(index); }}><span /></button>)}
      <button className="editorial-gallery__next" aria-label={cn ? "下一张图片" : "Next image"} onClick={() => manual(1)}>→</button>
      {autoplayMs > 0 && !motion.reduced && <button className="editorial-gallery__pause" aria-label={motion.paused ? cn ? "继续轮播" : "Resume slideshow" : cn ? "暂停轮播" : "Pause slideshow"} onClick={motion.toggle}>{motion.paused ? "▶" : "Ⅱ"}</button>}
    </div>
  </section>;
}
