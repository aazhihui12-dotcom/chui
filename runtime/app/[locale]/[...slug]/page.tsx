import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getCatalog, getRuntimePage } from "@/runtime/lib/catalog";
import {
  categories as legacyCategories,
  products as legacyProducts,
} from "@/content/products";
import { pageMetadata } from "@/lib/metadata";
import { editorialPaths } from "@/content/editorial";
import { ProductIndexTemplate } from "@/components/templates/ProductIndexTemplate";
import { ProductCategoryTemplate } from "@/components/templates/ProductCategoryTemplate";
import { ProductDetailTemplate } from "@/components/templates/ProductDetailTemplate";
import { ArticleListTemplate } from "@/components/templates/ArticleListTemplate";
import { ArticleDetailTemplate } from "@/components/templates/ArticleDetailTemplate";
import { EditorialTemplate } from "@/components/templates/EditorialTemplate";
import { FaqTemplate } from "@/components/templates/FaqTemplate";
import { ContactTemplate } from "@/components/templates/ContactTemplate";
import { DownloadsTemplate } from "@/components/templates/DownloadsTemplate";
import { SectionRenderer } from "@/components/site/SectionRenderer";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string; slug: string[] }> };
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const page = getRuntimePage(locale, slug);
  if (!page) notFound();
  return pageMetadata(page);
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const page = getRuntimePage(locale, slug);
  if (!page) notFound();
  if (page.sourceEmpty)
    return <main id="main-content" aria-label={page.title} />;
  const { products, categories, articles } = getCatalog();
  if (page.kind === "product-index")
    return <ProductIndexTemplate page={page} catalogProducts={products} />;
  if (page.kind === "product-category") {
    const category = [...categories, ...legacyCategories].find(
      (c) => c.id === page.categoryId,
    );
    if (!category) notFound();
    return (
      <ProductCategoryTemplate
        category={category}
        locale={locale}
        catalogProducts={[...products, ...legacyProducts]}
      />
    );
  }
  if (page.kind === "product-detail") {
    const product = [...products, ...legacyProducts].find(
      (p) => p.id === page.productId,
    );
    if (!product) notFound();
    return <ProductDetailTemplate product={product} locale={locale} />;
  }
  if (page.kind === "news-detail") {
    const article = articles.find((a) => a.id === page.articleId);
    if (!article) notFound();
    return (
      <ArticleDetailTemplate
        page={article.locales[locale]}
        catalogArticles={articles}
      />
    );
  }
  if (page.kind === "news-list" || page.legacyPath === "/Blog") {
    const category = page.legacyPath === "/NewsList/2.html" ? "faq" : "news";
    return (
      <ArticleListTemplate
        page={page}
        articles={articles
          .filter((a) => a.category === category)
          .map((a) => a.locales[locale])}
      />
    );
  }
  if (page.legacyPath === "/FAQ")
    return (
      <FaqTemplate
        page={page}
        articles={articles
          .filter((a) => a.category === "faq")
          .map((a) => a.locales[locale])}
      />
    );
  if (page.kind === "contact") return <ContactTemplate page={page} />;
  if (page.kind === "download") return <DownloadsTemplate page={page} />;
  if (
    page.kind === "content" &&
    editorialPaths.some((p) => p === page.legacyPath)
  )
    return <EditorialTemplate page={page} />;
  return (
    <main id="main-content" className="home-section">
      <h1>{page.title}</h1>
      <SectionRenderer blocks={page.blocks} />
    </main>
  );
}
