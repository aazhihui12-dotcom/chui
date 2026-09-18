import type { Locale } from "@/lib/i18n";
import { getPage } from "@/lib/content";

export function getAlternatePath(locale: Locale, slug: string[]): string {
  const alternate: Locale = locale === "en" ? "cn" : "en";
  return getPage(alternate, slug)
    ? `/${alternate}${slug.length ? `/${slug.join("/")}` : ""}`
    : `/${alternate}`;
}
