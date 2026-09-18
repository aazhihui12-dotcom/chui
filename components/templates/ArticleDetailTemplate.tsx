import type { ArticlePage } from "@/content/schema";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import { ArticleSharing } from "@/components/interactive/ArticleSharing";
import { articles } from "@/content/articles";
import "./content-pages.css";

export function ArticleDetailTemplate({ page }: { page: ArticlePage }) {
  const cn = page.locale === "cn";
  const faq = page.category === "faq";
  const siblings = articles.filter((article) => article.category === page.category);
  const index = siblings.findIndex((article) => article.id === page.id);
  const previous = siblings[index - 1]?.locales[page.locale];
  const next = siblings[index + 1]?.locales[page.locale];
  return <main id="main-content" className="article-detail support-page">
    <div className="article-banner">{cn ? "博客" : "Blog"}</div>
    <article className="support-container article-detail__body">
      <header><p className="support-eyebrow">{faq ? (cn ? "常见问题" : "FAQ") : (cn ? "博客与新闻" : "Blog & News")}</p><h1>{page.title}</h1>
        <p className="article-metadata"><span>{page.author}</span><time dateTime={page.publishedAt.replace(" ", "T")}>{page.publishedAt}</time></p>
      </header>
      {page.provenance.coverage === "source-placeholder" && <aside role="note" className="source-note">{cn ? "原站仅提供占位内容，暂无完整文章。" : "The source provides placeholder content only; a full article is not available."}</aside>}
      <SectionRenderer blocks={page.blocks} />
      <ArticleSharing locale={page.locale} title={page.title} />
      <nav className="article-neighbors" aria-label={cn ? "相邻文章" : "Adjacent articles"}>
        {previous ? <a href={`/${page.locale}${previous.legacyPath}`}>{cn ? "上一篇" : "Prev"} : {previous.title}</a> : <span />}
        {next ? <a href={`/${page.locale}${next.legacyPath}`}>{cn ? "下一篇" : "Next"} : {next.title}</a> : <span />}
      </nav>
      <a className="article-back" href={`/${page.locale}/${faq ? "FAQ" : "Blog"}`}>{faq ? (cn ? "返回常见问题" : "Back to FAQ") : (cn ? "返回博客" : "Back to Blog")}</a>
    </article>
  </main>;
}
