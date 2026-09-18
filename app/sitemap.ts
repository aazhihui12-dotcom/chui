import type { MetadataRoute } from "next";
import { allPages } from "@/lib/content";
import { languageAlternates, pageUrl } from "@/lib/metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages.map(page => ({
    url: pageUrl(page.locale, page.legacyPath),
    alternates: { languages: languageAlternates(page.legacyPath) },
  }));
}
