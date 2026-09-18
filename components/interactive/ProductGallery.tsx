"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ImageAsset, Locale } from "@/content/schema";

export function ProductGallery({ images, model, locale }: { images: ImageAsset[]; model: string; locale: Locale }) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const cn = locale === "cn";
  const image = images[selected];
  useEffect(() => {
    if (!open) return;
    const node = dialog.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (typeof node.showModal === "function") node.showModal();
    else node.setAttribute("open", "");
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key === "ArrowRight") setSelected((index) => (index + 1) % images.length);
      if (event.key === "ArrowLeft") setSelected((index) => (index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; trigger.current?.focus(); };
  }, [open, images.length]);
  if (!image) return null;
  return <div className="product-gallery">
    <button ref={trigger} className="product-gallery__main" aria-label={cn ? `放大${model}图片` : `Enlarge ${model} image`} onClick={() => setOpen(true)}>
      <img src={image.src} alt={image.alt} width="700" height="700" fetchPriority="high" />
      <span className="product-gallery__zoom" aria-hidden="true">＋</span>
    </button>
    <div className="product-gallery__thumbnails" aria-label={cn ? "产品图片" : "Product images"}>
      {images.map((item, index) => <button key={`${item.src}-${index}`} aria-label={cn ? `查看${model}第${index + 1}张图片` : `View image ${index + 1} of ${model}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={item.src} alt="" width="90" height="90" loading="lazy" /></button>)}
    </div>
    {open && <dialog ref={dialog} className="product-lightbox" aria-modal="true" aria-labelledby={titleId} onCancel={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="product-lightbox__header"><h2 id={titleId}>{cn ? `${model}图片库` : `${model} gallery`}</h2><button ref={closeButton} aria-label={cn ? "关闭图片" : "Close image"} onClick={() => setOpen(false)}>×</button></div>
      <img src={image.src} alt={image.alt} width="1000" height="1000" />
      <div className="product-lightbox__controls"><button aria-label={cn ? "上一张图片" : "Previous image"} onClick={() => setSelected((selected - 1 + images.length) % images.length)}>←</button><span aria-live="polite">{selected + 1} / {images.length}</span><button aria-label={cn ? "下一张图片" : "Next image"} onClick={() => setSelected((selected + 1) % images.length)}>→</button></div>
    </dialog>}
  </div>;
}
