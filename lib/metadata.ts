import type { Metadata } from "next";
import type { SitePage, Locale } from "@/content/schema";
import { localizedLegacyPath } from "@/lib/locale-path";
import { apowerSeo } from '@/content/apower';
import { sitePath } from '@/lib/site-path';

// Set the deployment origin before building; static exports bake these URLs into HTML.
export function siteOrigin(): string {
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL");
  return url.origin;
}

export function pageUrl(locale: Locale, legacyPath: string): string {
  legacyPath = localizedLegacyPath(legacyPath, locale);
  return `${siteOrigin()}${sitePath(`/${locale}${legacyPath === "/" ? "" : legacyPath.replace(/\/$/, "")}/`)}`;
}

export function languageAlternates(legacyPath: string): Record<string, string> {
  return {
    en: pageUrl("en", legacyPath),
    "zh-CN": pageUrl("cn", legacyPath),
    "x-default": pageUrl("en", legacyPath),
  };
}

export function pageMetadata(page: SitePage): Metadata {
  return {
    ...apowerSeo(page),
    alternates: {
      canonical: pageUrl(page.locale, page.legacyPath),
      languages: languageAlternates(page.legacyPath),
    },
  };
}
