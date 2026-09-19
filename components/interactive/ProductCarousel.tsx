"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import type { Locale, Product } from "@/content/schema";
import { useCarouselMotion } from "./useCarouselMotion";

export function ProductCarousel({ products, locale }: { products: Product[]; locale: Locale }) {
  const [start, setStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const trackId = useId();
  const cn = locale === "cn";
  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 700px)");
    if (!query) return;
    const update = () => setVisibleCount(query.matches ? 2 : 3);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const lastStart = Math.max(0, products.length - visibleCount);
  const offset = Math.min(start, lastStart);
  const end = Math.min(offset + visibleCount, products.length);
  const groupPositions = Array.from({ length: Math.ceil(products.length / visibleCount) }, (_, index) => Math.min(index * visibleCount, lastStart));
  const activeGroup = groupPositions.findLastIndex((position) => position <= offset);
  const motion = useCarouselMotion(direction => setStart((offset + direction + lastStart + 1) % (lastStart + 1)), lastStart > 0 ? 4000 : 0);
  const manual = (position: number) => { motion.interaction(); setStart(position); };

  return <section {...motion.bindings} className="product-carousel" aria-label={cn ? "产品目录" : "Product catalog"} aria-roledescription="carousel" style={{ ...motion.bindings.style, "--carousel-count": visibleCount, "--carousel-offset": offset } as CSSProperties}>
    <div className="product-carousel__viewport">
      <div id={trackId} className="product-carousel__track">
        {products.map((product, index) => {
          const visible = index >= offset && index < end;
          return <div key={product.id} className="product-carousel__slide" role="group" aria-roledescription="slide" aria-label={cn ? `第${index + 1}款，共${products.length}款` : `${index + 1} of ${products.length}`} aria-hidden={!visible} inert={!visible}>
            <a href={`/${locale}${product.locales[locale].legacyPath}`} className="product-card" aria-label={product.model} tabIndex={visible ? 0 : -1}>
              {product.image && <img src={product.image.src} alt="" width="400" height="400" loading="lazy" />}
              <h2>{product.model}</h2><span aria-hidden="true">↗</span>
            </a>
          </div>;
        })}
      </div>
    </div>
    <div className="product-carousel__controls">
      <button aria-label={cn ? "上一组产品" : "Previous products"} aria-controls={trackId} disabled={offset === 0} onClick={() => manual(offset - 1)}>←</button>
      <p className="sr-only" role="status" aria-live={motion.playing ? "off" : "polite"} aria-atomic="true">{cn ? `第${offset + 1}–${end}款，共${products.length}款` : `Products ${offset + 1}–${end} of ${products.length}`}</p>
      <div className="product-carousel__dots">{groupPositions.map((position, index) => <button key={index} aria-label={cn ? `转到第${index + 1}组产品` : `Go to product group ${index + 1}`} aria-controls={trackId} aria-current={activeGroup === index ? "true" : undefined} onClick={() => manual(position)}><span /></button>)}</div>
      <button className="product-carousel__next" aria-label={cn ? "下一组产品" : "Next products"} aria-controls={trackId} disabled={offset === lastStart} onClick={() => manual(offset + 1)}>→</button>
      {lastStart > 0 && !motion.reduced && <button className="product-carousel__pause" aria-label={motion.paused ? cn ? "继续轮播" : "Resume slideshow" : cn ? "暂停轮播" : "Pause slideshow"} onClick={motion.toggle}>{motion.paused ? "▶" : "Ⅱ"}</button>}
    </div>
  </section>;
}
