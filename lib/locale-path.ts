import pairs from "@/content/route-correspondence.json";
import type { Locale } from "@/lib/i18n";

// The CMS assigns independent IDs to translations. Resolve either ID by pair.
export function localizedLegacyPath(path: string, locale: Locale): string {
  return pairs.find(pair => pair.en === path || pair.cn === path)?.[locale] ?? path;
}

export const compatibilityParams = pairs.map(pair => ({ locale: "cn", slug: pair.en.slice(1).split("/") }));
