import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPages, getPage, productStaticParams, articleStaticParams } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { categories, products } from "@/content/products";
import { ProductIndexTemplate } from "@/components/templates/ProductIndexTemplate";
import { ProductCategoryTemplate } from "@/components/templates/ProductCategoryTemplate";
import { ProductDetailTemplate } from "@/components/templates/ProductDetailTemplate";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import { EditorialTemplate } from "@/components/templates/EditorialTemplate";
import { editorialPaths } from "@/content/editorial";
import { articles } from "@/content/articles";
import { ArticleListTemplate } from "@/components/templates/ArticleListTemplate";
import { ArticleDetailTemplate } from "@/components/templates/ArticleDetailTemplate";
import { FaqTemplate } from "@/components/templates/FaqTemplate";
import { ContactTemplate } from "@/components/templates/ContactTemplate";
import { DownloadsTemplate } from "@/components/templates/DownloadsTemplate";

type Props = { params: Promise<{ locale: string; slug: string[] }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return [...productStaticParams(), ...articleStaticParams(), ...allPages.filter((page) => page.kind !== "home" && page.kind !== "news-detail" && !page.kind.startsWith("product-")).map((page) => ({ locale: page.locale, slug: page.legacyPath.split("/").filter(Boolean) }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const page = getPage(locale, slug);
  if (!page) notFound();
  return { title: page.seo.title, description: page.seo.description };
}

export default async function ContentPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const page = getPage(locale, slug);
  if (!page) notFound();
  if (page.kind === "product-index") return <ProductIndexTemplate page={page} />;
  if (page.kind === "product-category") {
    const category = categories.find((item) => item.id === page.categoryId);
    if (!category) notFound();
    return <ProductCategoryTemplate category={category} locale={locale} />;
  }
  if (page.kind === "product-detail") {
    const product = products.find((item) => item.id === page.productId);
    if (!product) notFound();
    return <ProductDetailTemplate product={product} locale={locale} />;
  }
  if (page.kind === "news-detail") {
    const article = articles.find((item) => item.id === page.articleId);
    if (!article) notFound();
    return <ArticleDetailTemplate page={article.locales[locale]} />;
  }
  if (page.kind === "news-list" || page.legacyPath === "/Blog") {
    const category = page.legacyPath === "/NewsList/2.html" ? "faq" : "news";
    const entries = articles.filter((article) => article.category === category).map((article) => article.locales[locale]).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return <ArticleListTemplate key={`${locale}${page.legacyPath}`} page={page} articles={entries} />;
  }
  if (page.legacyPath === "/FAQ") return <FaqTemplate page={page} articles={articles.filter((article) => article.category === "faq").map((article) => article.locales[locale])} />;
  if (page.kind === "contact") return <ContactTemplate page={page} />;
  if (page.kind === "download") return <DownloadsTemplate page={page} />;
  if (page.kind === "content" && editorialPaths.some((path) => path === page.legacyPath)) return <EditorialTemplate page={page} />;
  return <main id="main-content" className="home-section"><h1>{page.title}</h1><SectionRenderer blocks={page.blocks} /></main>;
}
