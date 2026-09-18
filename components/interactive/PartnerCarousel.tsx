"use client";
import { useState } from "react";
import type { ImageAsset, Locale } from "@/content/schema";
import { Media } from "@/components/site/Media";
import { useCarouselMotion } from "./useCarouselMotion";

/** Source gallery layout 109: five desktop logos, 1.5 mobile logos, 4s autoplay. */
export function PartnerCarousel({ images, locale, label }: { images: ImageAsset[]; locale: Locale; label: string }) {
  const [active, setActive] = useState(0);
  const change = (direction: number) => setActive(index => (index + direction + images.length) % images.length);
  const motion = useCarouselMotion(change, images.length > 1 ? 4000 : 0);
  const cn = locale === "cn";
  const ordered = [...images.slice(active), ...images.slice(0, active)];
  return <div className="partner-carousel" role="region" aria-label={label} aria-roledescription="carousel" {...motion.bindings}>
    <div className="partner-carousel__viewport"><div className="partner-carousel__track">{ordered.map((image, index) => <div key={`${image.src}-${index}`}><Media image={image} /></div>)}</div></div>
    <div className="partner-carousel__controls">
      <button aria-label={cn ? "上一组合作伙伴" : "Previous partners"} onClick={() => { motion.interaction(); change(-1); }}>←</button>
      <span className="sr-only" role="status" aria-live={motion.playing ? "off" : "polite"}>{active + 1} / {images.length}</span>
      <button aria-label={cn ? "下一组合作伙伴" : "Next partners"} onClick={() => { motion.interaction(); change(1); }}>→</button>
      {!motion.reduced && <button aria-label={cn ? (motion.paused ? "继续轮播" : "暂停轮播") : (motion.paused ? "Resume slideshow" : "Pause slideshow")} onClick={motion.toggle}>{motion.paused ? "▶" : "Ⅱ"}</button>}
    </div>
  </div>;
}
