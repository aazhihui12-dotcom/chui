"use client";
import { useState } from "react";
import type { Locale } from "@/content/schema";

/** The source uses this third-party player; no provider request before activation. */
export function SourceVideo({ video, locale, poster, title }: { video: string; locale: Locale; poster?:string; title?:string }) {
  const [active, setActive] = useState(false);
  const cn = locale === "cn";
  return <div>
    <div className="source-video">
      {active ? <iframe src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1`} title={title ?? "APOWER TECH Overview"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <button aria-label={cn ? "播放工厂概览视频" : "Play factory overview video"} onClick={() => setActive(true)}>
        {poster && <img src={poster} alt="" width={1280} height={720} loading="lazy" decoding="async" />}
        <strong>{title ?? 'APOWER TECH'}</strong>
        <span aria-hidden="true">{poster ? <svg width="24" height="28" viewBox="0 0 24 28" focusable="false"><path d="M2 1v26l21-13z" fill="currentColor" /></svg> : '▶'}</span>
      </button>}
    </div>
    {active && <a className="source-video__fallback" href={`https://www.youtube.com/watch?v=${video}`} target="_blank" rel="noreferrer">{cn ? "在 YouTube 打开视频" : "Open video on YouTube"}</a>}
  </div>;
}
