import type { ArticlePage, SitePage } from "@/content/schema";
import { Accordion } from "@/components/interactive/Accordion";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import "./content-pages.css";
import { apowerFaq } from '@/content/apower';

export function FaqTemplate({ page, articles }: { page: SitePage; articles: ArticlePage[] }) {
  return <main id="main-content" className="faq-page support-page">
    <header className="support-banner"><h1>{page.title}</h1></header>
    <div className="support-container faq-list">{apowerFaq(page.locale).map(article => <Accordion key={article.id} title={article.question}>
      <p>{article.answer}</p>
    </Accordion>)}</div>
  </main>;
}
