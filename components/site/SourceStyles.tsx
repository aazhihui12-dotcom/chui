"use client";

import { usePathname } from "next/navigation";
import { localizedLegacyPath } from "@/lib/locale-path";

/** Per-page, source-measured typography. The marker scopes retained React styles. */
export function SourceStyles() {
  const pathname = usePathname() || "";
  const [locale, ...slug] = pathname.split("/").filter(Boolean);
  if (locale !== "en" && locale !== "cn") return null;
  const path = localizedLegacyPath(`/${slug.join("/")}`, locale);
  const route = `/${locale}${path === "/" ? "" : path}`;
  return <><span hidden data-source-page={route} /><link rel="stylesheet" href={`/source-styles/${route.slice(1).replaceAll("/", "_")}.css`} precedence="source" /></>;
}
