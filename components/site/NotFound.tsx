"use client";

import { sitePath } from "@/lib/site-path";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { BrandLogo } from "./BrandLogo";

const subscribe = () => () => {};

export default function NotFound() {
  const currentPath = usePathname();
  // Every unknown URL shares one exported 404.html. Match its initial English
  // snapshot while hydrating, then read the requested URL for localization.
  const pathname = useSyncExternalStore(subscribe, () => currentPath, () => null);
  const chinese = pathname === "/cn" || pathname?.startsWith("/cn/");
  return (
    <main id="main-content" className="not-found-page" lang={chinese ? "zh-CN" : "en"}>
      <div className="not-found-page__brand"><BrandLogo width={180} /></div>
      <p className="not-found-page__code">404</p>
      <h1>{chinese ? "页面未找到" : "Page not found"}</h1>
      <p>{chinese ? "您访问的页面不存在或已被移动。" : "The page you are looking for does not exist or has moved."}</p>
      <a className="button-primary" href={sitePath(chinese ? "/cn" : "/en")}>{chinese ? "返回首页" : "Back to home"}</a>
    </main>
  );
}
