import type { Article, ArticlePage, Locale } from "@/content/schema";
import { apowerFaq } from "@/content/apower";

export function createFaqSeed(): Article[] {
  const entries = { cn: apowerFaq("cn"), en: apowerFaq("en") };
  return entries.en.map((entry, index) => {
    const id = `apower-faq-${entry.id}`;
    const legacyPath = `/NewsDetail/${id}.html`;
    const publishedAt = "2026-10-30";
    const locales = Object.fromEntries(
      (["cn", "en"] as Locale[]).map((locale) => {
        const copy = entries[locale][index];
        const page: ArticlePage = {
          id,
          articleId: id,
          locale,
          legacyPath,
          kind: "news-detail",
          title: copy.question,
          description: copy.answer.slice(0, 160),
          seo: {
            title: `${copy.question} | APOWER TECH`,
            description: copy.answer.slice(0, 160),
          },
          blocks: [{ type: "rich-text", paragraphs: [copy.answer] }],
          images: [],
          publishedAt,
          author: "APOWER TECH",
          category: "faq",
          provenance: {
            sourceUrl: "APOWER CMS",
            sourceLocale: locale,
            languageVerified: true,
            translation: "authored",
            coverage: "full",
          },
        };
        return [locale, page];
      }),
    ) as Article["locales"];
    return {
      id,
      legacyPath,
      publishedAt,
      author: "APOWER TECH",
      category: "faq",
      locales,
    };
  });
}
