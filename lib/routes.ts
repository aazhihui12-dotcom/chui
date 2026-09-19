import type { Locale } from "@/lib/i18n";
import { getPage } from "@/lib/content";
import { localizedLegacyPath } from "@/lib/locale-path";

export function getAlternatePath(locale: Locale, slug: string[]): string {
  const alternate: Locale = locale === "en" ? "cn" : "en";
  return getPage(alternate, slug)
    ? `/${alternate}${slug.length ? localizedLegacyPath(`/${slug.join("/")}`, alternate) : ""}`
    : `/${alternate}`;
}
