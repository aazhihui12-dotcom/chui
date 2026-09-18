"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export default function NotFound() {
  const currentPath = usePathname();
  // Every unknown URL shares one exported 404.html. Match its initial English
  // snapshot while hydrating, then read the requested URL for localization.
  const pathname = useSyncExternalStore(subscribe, () => currentPath, () => null);
  const chinese = pathname === "/cn" || pathname?.startsWith("/cn/");
  return (
    <main id="main-content" className="not-found-page" lang={chinese ? "zh-CN" : "en"}>
      <span className="site-brand__mark" aria-label="LBH Appliances">LBH</span>
      <p className="not-found-page__code">404</p>
      <h1>{chinese ? "页面未找到" : "Page not found"}</h1>
      <p>{chinese ? "您访问的页面不存在或已被移动。" : "The page you are looking for does not exist or has moved."}</p>
      <a className="button-primary" href={chinese ? "/cn" : "/en"}>{chinese ? "返回首页" : "Back to home"}</a>
    </main>
  );
}
