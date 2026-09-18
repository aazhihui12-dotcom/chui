"use client";

import { useState } from "react";
import type { ImageAsset, Locale } from "@/content/schema";
import { Media } from "@/components/site/Media";

export interface HeroSlide { title: string; subtitle: string; image: ImageAsset; bullets?: string[]; href?: string }

export function HeroCarousel({ slides, locale }: { slides: HeroSlide[]; locale: Locale }) {
  const [active, setActive] = useState(0);
  const cn = locale === "cn";
  const change = (direction: number) => setActive((index) => (index + direction + slides.length) % slides.length);
  return <section className="home-hero" data-locale={locale} aria-label={cn ? "产品与品牌展示" : "Products and brand highlights"} aria-roledescription="carousel">
    {slides.map((slide, index) => <div key={slide.title} hidden={index !== active} className={index ? "hero-slide hero-slide--product" : "hero-slide"} role="group" aria-roledescription="slide" aria-label={`${index + 1} / ${slides.length}`}>
      <Media image={{ ...slide.image, width: index ? 900 : 1920, height: 800, alt: index ? slide.title : "" }} priority={index === 0} className="home-hero__image" />
      <div className="home-hero__inner">
        {index === 0 ? <h1 id="home-title">{slide.title}<br /><span>{slide.subtitle}</span></h1> : <><p className="eyebrow">LBH APPLIANCES</p><h2>{slide.title}</h2><p className="hero-slide__subtitle">{slide.subtitle}</p></>}
        {slide.bullets && <ul>{slide.bullets.map((bullet) => <li key={bullet}><span aria-hidden="true">✓</span>{bullet}</li>)}</ul>}
        {slide.href && <a className="lbh-button" href={slide.href}>{cn ? "探索产品" : "Explore product"}<span aria-hidden="true"> ↗</span></a>}
      </div>
    </div>)}
    <div className="hero-controls">
      <button aria-label={cn ? "上一张" : "Previous slide"} onClick={() => change(-1)}>←</button>
      <div className="hero-controls__dots">{slides.map((slide, index) => <button key={slide.title} aria-label={cn ? `转到第${index + 1}张` : `Go to slide ${index + 1}`} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)}><span /></button>)}</div>
      <button aria-label={cn ? "下一张" : "Next slide"} onClick={() => change(1)}>→</button>
      <span className="sr-only" aria-live="polite">{cn ? "当前展示" : "Current slide"}: {active + 1} / {slides.length}</span>
    </div>
  </section>;
}
