import { sitePath } from "@/lib/site-path";
import type { Category, Locale } from "@/content/schema";
import { products as legacyProducts } from "@/content/products";
import { apowerCategories as categories, apowerProducts, artwork } from '@/content/apower';
const products=[...apowerProducts,...legacyProducts];
import { ProductCatalog } from "@/components/interactive/ProductCatalog";

export function ProductCategoryTemplate({ category, locale }: { category: Category; locale: Locale }) {
  const cn = locale === "cn";
  const banner = categories.some(item => item.id === category.id) ? artwork('product-range-banner') : category.image;
  return <main id="main-content" className={`product-page product-category-page${categories.some(item=>item.id===category.id)?' apower-v3':''}`}>
    <div className="product-category-banner">{banner && <img src={sitePath(banner.src)} alt="" width={banner.width ?? 1920} height={banner.height ?? 500} fetchPriority="high" />}<h1>{category.title[locale]}</h1></div>
    <div className="product-category-layout">
      <nav className="product-category-nav" aria-label={cn ? "产品分类" : "Product categories"}>
        <a className="product-category-nav__all" href={sitePath(`/${locale}/ProductIndex`)}>{cn ? "显示全部" : "Show All"}</a>
        <h2>{cn ? "产品分类" : "Product category"}</h2>
        {categories.map((item) => <a key={item.id} href={sitePath(`/${locale}${item.legacyPath}`)} aria-current={item.id === category.id ? "page" : undefined}>{item.title[locale]}</a>)}
      </nav>
      <div className="product-category-results"><ProductCatalog products={category.productIds.flatMap((id) => products.find((product) => product.id === id) ?? [])} categories={categories} locale={locale} /></div>
    </div>
  </main>;
}
