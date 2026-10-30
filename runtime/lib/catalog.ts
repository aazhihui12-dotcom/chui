import { join, resolve } from "node:path";
import { apowerProducts, apowerCategories } from "@/content/apower";
import { articles as seedArticles } from "@/content/articles";
import { allPages } from "@/lib/content";
import { localizedLegacyPath } from "@/lib/locale-path";
import { CmsStore } from "@/lib/cms/store";
import { createFaqSeed } from "@/lib/cms/faq-seed";
import { isLegacyFaq } from "@/lib/cms/content";
import type { Locale, Product, Article } from "@/content/schema";

export function dataDirectory() {
  return resolve(
    process.env.APOWER_DATA_DIR ?? join(process.cwd(), ".private", "cms"),
  );
}
const shared = globalThis as typeof globalThis & { apowerCmsStore?: CmsStore };
export function getCmsStore() {
  if (!shared.apowerCmsStore) {
    const store = new CmsStore(join(dataDirectory(), "cms.sqlite"));
    store.seed(apowerProducts, seedArticles, createFaqSeed());
    if (!store.users().length) {
      const password = process.env.APOWER_BOOTSTRAP_PASSWORD;
      if (!password)
        throw new Error(
          "APOWER_BOOTSTRAP_PASSWORD is required for first initialization",
        );
      store.createUser("admin", password, "admin");
    }
    shared.apowerCmsStore = store;
  }
  return shared.apowerCmsStore;
}
export function getCatalog(store = getCmsStore()) {
  // The database is authoritative: never merge drafts or tombstones with published seeds.
  const rows = store.list("product", "published"),
    positions = new Map(apowerProducts.map((p, i) => [p.id, i]));
  const products = rows
    .map((r) => r.payload as Product)
    .sort(
      (a, b) =>
        (positions.get(a.id) ?? 1000) - (positions.get(b.id) ?? 1000) ||
        a.model.localeCompare(b.model),
    );
  const publishedArticles = store
    .list("article", "published")
    .map((r) => r.payload as Article)
    .sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) ||
        a.id.localeCompare(b.id, undefined, { numeric: true }),
    );
  const articles = publishedArticles.filter((a) => !isLegacyFaq(a));
  const legacyArticles = publishedArticles.filter(isLegacyFaq);
  const faqs = articles.filter((a) => a.category === "faq");
  const categories = apowerCategories.map((c) => ({
    ...c,
    productIds: products.filter((p) => p.categoryId === c.id).map((p) => p.id),
  }));
  return { products, articles, categories, legacyArticles, faqs };
}
export function getRuntimePages(store = getCmsStore()) {
  const catalog = getCatalog(store);
  return [
    ...allPages.filter(
      (p) =>
        p.kind !== "news-detail" &&
        !(p.kind === "product-detail" && p.productId?.startsWith("AP-")),
    ),
    ...catalog.products.flatMap((p) => [p.locales.cn, p.locales.en]),
    ...catalog.articles.flatMap((a) => [a.locales.cn, a.locales.en]),
    ...catalog.legacyArticles.flatMap((a) => [a.locales.cn, a.locales.en]),
  ];
}
export function getRuntimePage(
  locale: Locale,
  slug: string[],
  store = getCmsStore(),
) {
  const key = localizedLegacyPath(`/${slug.join("/")}`, locale);
  return getRuntimePages(store).find(
    (p) => p.locale === locale && p.legacyPath === key,
  );
}
