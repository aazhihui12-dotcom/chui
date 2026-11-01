import type { Locale } from "@/lib/i18n";
import routeIndex from "@/content/route-index.json";
import { localizedLegacyPath } from "@/lib/locale-path";
const routes = { en: new Set(routeIndex.en), cn: new Set(routeIndex.cn) };

export function getAlternatePath(locale: Locale, slug: string[]): string {
  const alternate: Locale = locale === "en" ? "cn" : "en";
  return routes[alternate].has(localizedLegacyPath(`/${slug.join("/")}`, alternate))
    ? `/${alternate}${slug.length ? localizedLegacyPath(`/${slug.join("/")}`, alternate) : ""}`
    : `/${alternate}`;
}
