"use client";
import { useEffect, useId, useRef, useState } from 'react';
import type { ImageAsset, Locale } from '@/content/schema';
import { Media } from '@/components/site/Media';

/** Image-triggered description with the reference's upward panel entrance. */
export function ImageDescription({ image, title, description, locale }: { image: ImageAsset; title: string; description: string; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null), dialog = useRef<HTMLDialogElement>(null), close = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (dialog.current?.showModal) dialog.current.showModal();
    else dialog.current?.setAttribute('open', '');
    close.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); setOpen(false); } };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); trigger.current?.focus(); };
  }, [open]);
  return <article className="v3-image-description">
    <button ref={trigger} aria-label={title} onClick={() => setOpen(true)}><Media image={{...image,alt:''}}/><span aria-hidden="true">＋</span></button>
    <h3>{title}</h3>
    {open && <dialog ref={dialog} className="v3-description-dialog" aria-labelledby={id} aria-modal="true" onCancel={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <button ref={close} className="v3-dialog-close" aria-label={locale === 'cn' ? '关闭介绍' : 'Close description'} onClick={() => setOpen(false)}>×</button>
      <Media image={{...image,alt:''}}/><div><h2 id={id}>{title}</h2><p>{description}</p></div>
    </dialog>}
  </article>;
}
