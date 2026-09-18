"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

export function ArticleSharing({ locale, title }: { locale: Locale; title: string }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const cn = locale === "cn";
  useEffect(() => setUrl(window.location.href), []);
  const encoded = encodeURIComponent(url);
  const services = [
    ["X", "𝕏", `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(title)}`],
    ["Facebook", "f", `https://www.facebook.com/sharer/sharer.php?u=${encoded}`],
    ["Tumblr", "t", `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encoded}`],
    ["Pinterest", "p", `https://pinterest.com/pin/create/button/?url=${encoded}&description=${encodeURIComponent(title)}`],
    ["VK", "ᴠκ", `https://vk.com/share.php?url=${encoded}`],
    ["LinkedIn", "in", `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`],
  ];
  return <div className="article-sharing">
    <span>{cn ? "分享到：" : "Share To:"}</span>
    {services.map(([name, mark, href]) => <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={cn ? `分享到${name}` : `Share on ${name}`}>{mark}</a>)}
    <button aria-label={cn ? "复制文章链接" : "Copy article link"} type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(window.location.href); setStatus(cn ? "链接已复制" : "Link copied"); }
      catch { setStatus(cn ? "无法复制，请复制浏览器地址。" : "Could not copy. Please copy the browser address."); }
    }}>↗</button>
    <span role="status">{status}</span>
  </div>;
}
