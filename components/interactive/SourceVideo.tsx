"use client";
import { useState } from "react";
import type { Locale } from "@/content/schema";

/** The source uses this third-party player; no provider request before activation. */
export function SourceVideo({ video, locale }: { video: string; locale: Locale }) {
  const [active, setActive] = useState(false);
  const cn = locale === "cn";
  return <div>
    <div className="source-video">
      {active ? <iframe src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1`} title="LBH Comprehensive Overview 4.0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <button aria-label={cn ? "播放工厂概览视频" : "Play factory overview video"} onClick={() => setActive(true)}><strong>LBH Comprehensive Overview 4.0</strong><span aria-hidden="true">▶</span></button>}
    </div>
    {active && <a className="source-video__fallback" href={`https://www.youtube.com/watch?v=${video}`} target="_blank" rel="noreferrer">{cn ? "在 YouTube 打开视频" : "Open video on YouTube"}</a>}
  </div>;
}
