import { getRuntimePages } from "@/runtime/lib/catalog";
import { pageUrl, languageAlternates } from "@/lib/metadata";
export const dynamic = "force-dynamic";
export default function sitemap() {
  return getRuntimePages().map((p) => ({
    url: pageUrl(p.locale, p.legacyPath),
    alternates: { languages: languageAlternates(p.legacyPath) },
  }));
}
