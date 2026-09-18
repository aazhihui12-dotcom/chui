"use client";

import { useEffect, useState } from "react";
import type { ArticlePage, SitePage } from "@/content/schema";
import { Media } from "@/components/site/Media";
import "./content-pages.css";

export function ArticleListTemplate({ page, articles }: { page: SitePage; articles: ArticlePage[] }) {
  const cn = page.locale === "cn";
  const size = page.legacyPath === "/NewsList/2.html" ? 12 : 8;
  const count = Math.max(1, Math.ceil(articles.length / size));
  const [current, setCurrent] = useState(1);
  useEffect(() => {
    const sync = () => {
      const value = Number(new URLSearchParams(window.location.search).get("PageNo"));
      setCurrent(Number.isInteger(value) ? Math.min(count, Math.max(1, value)) : 1);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [count, page.legacyPath]);
  const navigate = (number: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("PageNo", String(number));
    window.history.pushState(null, "", url);
    setCurrent(number);
  };
  return <main id="main-content" className="article-list support-page">
    <header className="support-banner"><h1>{page.title}</h1></header>
    <div className="support-container">
      <nav className="support-links" aria-label={cn ? "文章分类" : "Article categories"}>
        <a href={`/${page.locale}/Blog`} aria-current={page.legacyPath !== "/NewsList/2.html" ? "page" : undefined}>{cn ? "博客与新闻" : "Blog & News"}</a>
        <a href={`/${page.locale}/NewsList/2.html`} aria-current={page.legacyPath === "/NewsList/2.html" ? "page" : undefined}>{cn ? "常见问题" : "FAQ"}</a>
      </nav>
      <div className="article-grid">{articles.slice((current - 1) * size, current * size).map((article) => <article className="article-card" key={article.id}>
        {article.images[0] && <Media image={article.images[0]} />}
        <time dateTime={article.publishedAt.replace(" ", "T")}>{article.publishedAt.slice(0, 10)}</time>
        <h2><a href={`/${page.locale}${article.legacyPath}`}>{article.title}{article.provenance.coverage === "source-placeholder" && <span className="sr-only"> — {article.id}</span>}</a></h2>
        <p>{article.description}</p>
        {article.provenance.coverage === "source-placeholder" && <small>{cn ? "原站占位内容" : "Source placeholder"}</small>}
      </article>)}</div>
      <nav className="content-pagination" aria-label={cn ? "文章分页" : "Article pagination"}>
        <button type="button" disabled={current === 1} onClick={() => navigate(current - 1)}>{cn ? "上一页" : "Previous page"}</button>
        <span role="status" aria-live="polite">{current} / {count}</span>
        <button type="button" disabled={current === count} onClick={() => navigate(current + 1)}>{cn ? "下一页" : "Next page"}</button>
      </nav>
    </div>
  </main>;
}
