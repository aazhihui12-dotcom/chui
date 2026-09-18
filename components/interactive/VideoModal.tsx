"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/schema";

export function VideoModal({ src, poster, locale }: { src: string; poster: string; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const cn = locale === "cn";
  useEffect(() => {
    if (!open) return;
    const node = dialog.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (typeof node.showModal === "function") node.showModal();
    else node.setAttribute("open", "");
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      // showModal makes the surrounding page inert and preserves native media
      // control tab order. A host-level trap would skip the video shadow tree.
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; trigger.current?.focus(); };
  }, [open]);
  return <>
    <button ref={trigger} className="video-preview" aria-label={cn ? "播放制造视频" : "Play manufacturing video"} onClick={() => { setFailed(false); setOpen(true); }}>
      <img src={poster} alt="" width="1280" height="720" loading="lazy" />
      <span className="video-preview__play" aria-hidden="true">▶</span>
      <span className="video-preview__caption">{cn ? "走进LBH制造体系" : "Inside LBH manufacturing"}</span>
    </button>
    {open && <dialog ref={dialog} className="video-dialog" aria-modal="true" aria-labelledby="video-title" onCancel={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="video-dialog__content"><div className="video-dialog__top"><h2 id="video-title">{cn ? "我们的制造体系" : "Our manufacturing system"}</h2><button ref={close} aria-label={cn ? "关闭视频" : "Close video"} onClick={() => setOpen(false)}>×</button></div>
        <video src={src} poster={poster} controls playsInline preload="metadata" aria-label={cn ? "制造视频" : "Manufacturing video"} onError={() => setFailed(true)} />
        {failed && <p role="alert">{cn ? "视频暂时无法播放。" : "The video could not be played."} <a href={src}>{cn ? "打开视频文件" : "Open video file"}</a></p>}
      </div>
    </dialog>}
  </>;
}
