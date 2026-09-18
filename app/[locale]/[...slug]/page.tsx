import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPages, getPage, productStaticParams } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { categories, products } from "@/content/products";
import { ProductIndexTemplate } from "@/components/templates/ProductIndexTemplate";
import { ProductCategoryTemplate } from "@/components/templates/ProductCategoryTemplate";
import { ProductDetailTemplate } from "@/components/templates/ProductDetailTemplate";
import { SectionRenderer } from "@/components/site/SectionRenderer";

type Props = { params: Promise<{ locale: string; slug: string[] }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return [...productStaticParams(), ...allPages.filter((page) => page.kind !== "home" && !page.kind.startsWith("product-")).map((page) => ({ locale: page.locale, slug: page.legacyPath.split("/").filter(Boolean) }))];
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
  return <main id="main-content" className="home-section"><h1>{page.title}</h1><SectionRenderer blocks={page.blocks} /></main>;
}
