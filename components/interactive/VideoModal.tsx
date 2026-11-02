"use client";

import { sitePath } from "@/lib/site-path";
import { mediaPath } from "@/lib/media-path";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/content/schema";

export function VideoModal({ src, poster, locale, background = false, videoId }: { src: string; poster: string; locale: Locale; background?: boolean; videoId?: string }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [backgroundPaused, setBackgroundPaused] = useState(true);
  const [backgroundVisible, setBackgroundVisible] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const manuallyPaused = useRef(false);
  const backgroundId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const backgroundVideo = useRef<HTMLVideoElement>(null);
  const cn = locale === "cn";
  useEffect(() => {
    if (!background) return;
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(preference ? !preference.matches : false);
    update();
    preference?.addEventListener("change", update);
    const observer = typeof window.IntersectionObserver === "function"
      ? new IntersectionObserver(([entry]) => setBackgroundVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5), { threshold: 0.5 })
      : undefined;
    if (observer && trigger.current) observer.observe(trigger.current);
    else setBackgroundVisible(true); // Compatible autoplay fallback for older browsers.
    return () => {
      observer?.disconnect();
      preference?.removeEventListener("change", update);
    };
  }, [background]);
  useEffect(() => {
    if (!background) return;
    if (!backgroundVisible || !motionAllowed || open) {
      backgroundVideo.current?.pause();
      return;
    }
    // preload="none" alone does not help when play() is called on mount.
    // Keep the source out of the DOM until at least half the preview is in view.
    if (!backgroundLoaded) { setBackgroundLoaded(true); return; }
    if (!manuallyPaused.current) void backgroundVideo.current?.play().catch(() => {});
  }, [background, backgroundVisible, backgroundLoaded, motionAllowed, open]);
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
      {background && backgroundLoaded ? <video id={backgroundId} ref={backgroundVideo} src={sitePath(src)} poster={mediaPath(poster)} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onPause={() => setBackgroundPaused(true)} onPlay={() => setBackgroundPaused(false)} /> : <img className={background ? "video-preview__background-poster" : undefined} src={mediaPath(poster)} alt="" width="1280" height="720" loading="lazy" decoding="async" />}
      {!background && <span className="video-preview__play" aria-hidden="true">▶</span>}
      <span className="video-preview__caption">{cn ? "走进 APOWER TECH 制造体系" : "Inside APOWER TECH manufacturing"}</span>
    </button>
    {background && backgroundLoaded && <button className="motion-control sr-only" type="button" aria-controls={backgroundId} onClick={() => {
      const video = backgroundVideo.current;
      if (!video) return;
      manuallyPaused.current = !video.paused;
      if (video.paused) void video.play().catch(() => {});
      else video.pause();
    }}>{backgroundPaused ? (cn ? "播放背景视频" : "Play background video") : (cn ? "暂停背景视频" : "Pause background video")}</button>}
    {open && <dialog ref={dialog} className="video-dialog" aria-modal="true" aria-labelledby="video-title" onCancel={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="video-dialog__content"><div className="video-dialog__top"><h2 id="video-title">{cn ? "我们的制造体系" : "Our manufacturing system"}</h2><button ref={close} aria-label={cn ? "关闭视频" : "Close video"} onClick={() => setOpen(false)}>×</button></div>
        {videoId ? <>
          <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`} title={cn ? "APOWER TECH · 制造视频" : "APOWER TECH · Manufacturing video"} width="1280" height="720" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          <button className="video-dialog__keyboard-close sr-only" type="button" onClick={() => setOpen(false)}>{cn ? "关闭视频并返回页面" : "Close video and return to page"}</button>
          <p><a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer">{cn ? "在 YouTube 打开视频" : "Open video on YouTube"}</a></p>
        </> : <video src={sitePath(src)} poster={mediaPath(poster)} controls playsInline preload="metadata" aria-label={cn ? "制造视频" : "Manufacturing video"} onError={() => setFailed(true)} />}
        {failed && <p role="alert">{cn ? "视频暂时无法播放。" : "The video could not be played."} <a href={sitePath(src)}>{cn ? "打开视频文件" : "Open video file"}</a></p>}
      </div>
    </dialog>}
  </>;
}
