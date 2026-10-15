"use client";

import { sitePath } from "@/lib/site-path";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/content/schema";

export function VideoModal({ src, poster, locale, background = false, videoId }: { src: string; poster: string; locale: Locale; background?: boolean; videoId?: string }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [backgroundPaused, setBackgroundPaused] = useState(true);
  const backgroundId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const backgroundVideo = useRef<HTMLVideoElement>(null);
  const cn = locale === "cn";
  useEffect(() => {
    if (!background || typeof window.matchMedia !== "function") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const video = backgroundVideo.current;
      if (!video) return;
      if (preference.matches) video.pause();
      else void video.play().catch(() => {});
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, [background]);
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
      {background ? <video id={backgroundId} ref={backgroundVideo} src={sitePath(src)} poster={sitePath(poster)} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onPause={() => setBackgroundPaused(true)} onPlay={() => setBackgroundPaused(false)} /> : <img src={sitePath(poster)} alt="" width="1280" height="720" loading="lazy" />}
      {!background && <span className="video-preview__play" aria-hidden="true">▶</span>}
      <span className="video-preview__caption">{cn ? "走进 APOWER TECH 制造体系" : "Inside APOWER TECH manufacturing"}</span>
    </button>
    {background && <button className="motion-control sr-only" type="button" aria-controls={backgroundId} onClick={() => {
      const video = backgroundVideo.current;
      if (!video) return;
      if (video.paused) void video.play().catch(() => {});
      else video.pause();
    }}>{backgroundPaused ? (cn ? "播放背景视频" : "Play background video") : (cn ? "暂停背景视频" : "Pause background video")}</button>}
    {open && <dialog ref={dialog} className="video-dialog" aria-modal="true" aria-labelledby="video-title" onCancel={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="video-dialog__content"><div className="video-dialog__top"><h2 id="video-title">{cn ? "我们的制造体系" : "Our manufacturing system"}</h2><button ref={close} aria-label={cn ? "关闭视频" : "Close video"} onClick={() => setOpen(false)}>×</button></div>
        {videoId ? <>
          <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`} title={cn ? "APOWER TECH · 制造视频" : "APOWER TECH · Manufacturing video"} width="1280" height="720" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          <button className="video-dialog__keyboard-close sr-only" type="button" onClick={() => setOpen(false)}>{cn ? "关闭视频并返回页面" : "Close video and return to page"}</button>
          <p><a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer">{cn ? "在 YouTube 打开视频" : "Open video on YouTube"}</a></p>
        </> : <video src={sitePath(src)} poster={sitePath(poster)} controls playsInline preload="metadata" aria-label={cn ? "制造视频" : "Manufacturing video"} onError={() => setFailed(true)} />}
        {failed && <p role="alert">{cn ? "视频暂时无法播放。" : "The video could not be played."} <a href={sitePath(src)}>{cn ? "打开视频文件" : "Open video file"}</a></p>}
      </div>
    </dialog>}
  </>;
}
