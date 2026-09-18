import type { Category, Locale } from "@/content/schema";
import { categories, products } from "@/content/products";
import { ProductCatalog } from "@/components/interactive/ProductCatalog";

export function ProductCategoryTemplate({ category, locale }: { category: Category; locale: Locale }) {
  const cn = locale === "cn";
  return <main id="main-content" className="product-page product-category-page">
    <div className="product-category-banner">{category.image && <img src={category.image.src} alt="" width="1920" height="500" fetchPriority="high" />}<h1>{category.title[locale]}</h1></div>
    <div className="product-category-layout">
      <nav className="product-category-nav" aria-label={cn ? "产品分类" : "Product categories"}>
        <a className="product-category-nav__all" href={`/${locale}/ProductIndex`}>{cn ? "显示全部" : "Show All"}</a>
        <h2>{cn ? "产品分类" : "Product category"}</h2>
        {categories.map((item) => <a key={item.id} href={`/${locale}${item.legacyPath}`} aria-current={item.id === category.id ? "page" : undefined}>{item.title[locale]}</a>)}
      </nav>
      <div className="product-category-results"><ProductCatalog products={category.productIds.flatMap((id) => products.find((product) => product.id === id) ?? [])} categories={categories} locale={locale} /></div>
    </div>
  </main>;
}
