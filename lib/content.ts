import { pages } from "@/content/pages";
import { products } from "@/content/products";
import { articles } from "@/content/articles";
import type { Locale, SitePage } from "@/content/schema";

export const allPages: SitePage[] = [
  ...pages,
  ...products.flatMap((product) => [product.locales.en, product.locales.cn]),
  ...articles.flatMap((article) => [article.locales.en, article.locales.cn]),
];

export function getPage(locale: Locale, slug: string[]): SitePage | undefined {
  const key = `/${slug.join("/")}`;
  return allPages.find((page) => page.locale === locale && page.legacyPath === key);
}

export function productStaticParams(): Array<{ locale: Locale; slug: string[] }> {
  return allPages.filter((page) => ["product-index", "product-category", "product-detail"].includes(page.kind))
    .map((page) => ({ locale: page.locale, slug: page.legacyPath.split("/").filter(Boolean) }));
}

export function articleStaticParams(): Array<{ locale: Locale; slug: string[] }> {
  return articles.flatMap((article) => [article.locales.en, article.locales.cn])
    .map((page) => ({ locale: page.locale, slug: page.legacyPath.split("/").filter(Boolean) }));
}
