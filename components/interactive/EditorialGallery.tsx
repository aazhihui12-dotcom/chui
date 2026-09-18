"use client";

import { useState } from "react";
import type { ImageAsset, Locale } from "@/content/schema";
import { Media } from "@/components/site/Media";

export function EditorialGallery({ images, label, locale }: { images: ImageAsset[]; label: string; locale: Locale }) {
  const [active, setActive] = useState(0);
  const cn = locale === "cn";
  const change = (direction: number) => setActive((index) => (index + direction + images.length) % images.length);
  return <section className="editorial-gallery" aria-label={label} aria-roledescription="carousel">
    {images.map((image, index) => <div key={image.src} hidden={index !== active} role="group" aria-roledescription="slide" aria-label={`${index + 1} / ${images.length}`}>
      <Media image={{ ...image, alt: `${label} ${index + 1}` }} />
    </div>)}
    <div className="editorial-gallery__controls">
      <button aria-label={cn ? "上一张图片" : "Previous image"} onClick={() => change(-1)}>←</button>
      <span role="status" aria-live="polite">{active + 1} / {images.length}</span>
      <button aria-label={cn ? "下一张图片" : "Next image"} onClick={() => change(1)}>→</button>
    </div>
  </section>;
}
