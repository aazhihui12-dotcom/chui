import type { ArticlePage, SitePage } from "@/content/schema";
import { Accordion } from "@/components/interactive/Accordion";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import "./content-pages.css";

export function FaqTemplate({ page, articles }: { page: SitePage; articles: ArticlePage[] }) {
  return <main id="main-content" className="faq-page support-page">
    <header className="support-banner"><h1>{page.title}</h1></header>
    <div className="support-container faq-list">{articles.map(article => <Accordion key={article.id} title={article.title}>
      <SectionRenderer blocks={article.blocks} />
      <a className="support-text-link" href={`/${page.locale}${article.legacyPath}`}>{page.locale === "cn" ? "查看详情" : "Read more"}</a>
    </Accordion>)}</div>
  </main>;
}
