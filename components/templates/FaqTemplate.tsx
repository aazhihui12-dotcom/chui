import type { ArticlePage, SitePage } from "@/content/schema";
import { Accordion } from "@/components/interactive/Accordion";
import "./content-pages.css";
import { apowerFaq } from '@/content/apower';

export interface FaqEntry { id: string | number; question: string; answer: string }
export function FaqTemplate({ page, faqEntries = apowerFaq(page.locale) }: { page: SitePage; articles: ArticlePage[]; faqEntries?: FaqEntry[] }) {
  return <main id="main-content" className="faq-page support-page">
    <header className="support-banner"><h1>{page.title}</h1></header>
    <div className="support-container faq-list">{faqEntries.map(article => <Accordion key={article.id} title={article.question}>
      <p>{article.answer}</p>
    </Accordion>)}</div>
  </main>;
}
