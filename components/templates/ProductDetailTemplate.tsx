import type { Locale, Product } from "@/content/schema";
import { categories } from "@/content/products";
import { siteConfig } from "@/content/site";
import { ProductGallery } from "@/components/interactive/ProductGallery";
import { ProductTabs } from "@/components/interactive/ProductTabs";
import { ProductInquiry } from "@/components/interactive/ProductInquiry";
import { SectionRenderer } from "@/components/site/SectionRenderer";

export function ProductDetailTemplate({ product, locale }: { product: Product; locale: Locale }) {
  const page = product.locales[locale];
  const category = categories.find((category) => category.id === product.categoryId)!;
  const labels = siteConfig[locale].labels;
  const cn = locale === "cn";
  return <main id="main-content" className="product-page product-detail">
    <nav className="product-breadcrumb" aria-label={cn ? "面包屑导航" : "Breadcrumb"}><a href={`/${locale}/ProductIndex`}>{labels.products}</a><span aria-hidden="true">/</span><a href={`/${locale}${category.legacyPath}`}>{category.title[locale]}</a><span aria-hidden="true">/</span><span aria-current="page">{product.model}</span></nav>
    <div className="product-detail__top">
      <ProductGallery images={page.images} model={product.model} locale={locale} />
      <section className="product-summary"><p className="eyebrow">{category.title[locale]}</p><h1>{product.model}</h1>
        <table className="product-specifications" aria-label={`${product.model} ${labels.specifications}`}><tbody>{page.specifications.map((spec, index) => <tr key={index}><th scope="row">{spec.label}</th><td>{spec.value}</td></tr>)}</tbody></table>
        <ProductInquiry context={{ locale, productId: product.id, model: product.model, title: page.inquiryTitle }} label={labels.inquiry} />
      </section>
    </div>
    <div id="product-details"><ProductTabs labels={[labels.specifications, labels.features, labels.accessories]} initialIndex={1}>
      {[
        <div key="parameters" className="product-parameter-list"><h2>{cn ? `${product.model}规格参数` : `${product.model} technical specifications`}</h2><dl>{page.specifications.map((spec, index) => <div key={index}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl></div>,
        <SectionRenderer key="features" blocks={page.features} />,
        page.accessories.length ? <SectionRenderer key="accessories" blocks={page.accessories} /> : <p key="accessories">{cn ? "联系我们，了解可选配件与定制方案。" : "Contact us for available accessories and customization options."}</p>,
      ]}
    </ProductTabs></div>
    <a className="product-back" href={`/${locale}${category.legacyPath}`}>← {cn ? "返回" : "Back to"} {category.title[locale]}</a>
  </main>;
}
