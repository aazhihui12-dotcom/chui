"use client";

import { useState } from "react";
import type { Category, Locale, Product } from "@/content/schema";
import { ProductCarousel } from "./ProductCarousel";

export function ProductCatalog({ products, categories, locale, filterable = false, presentation = "grid" }: { products: Product[]; categories: Category[]; locale: Locale; filterable?: boolean; presentation?: "grid" | "carousel" }) {
  const [category, setCategory] = useState("all");
  const shown = products.filter((product) => category === "all" || product.categoryId === category);
  const cn = locale === "cn";
  return <>
    {filterable && <div className="product-filters" aria-label={cn ? "按分类筛选" : "Filter by category"}>
      <button aria-pressed={category === "all"} onClick={() => setCategory("all")}>{cn ? "显示全部" : "Show All"}</button>
      {categories.map((item) => <button key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.title[locale]}</button>)}
    </div>}
    <p className="product-count" role="status">{cn ? `${shown.length} 款产品` : `${shown.length} products`}</p>
    {presentation === "carousel" ? <ProductCarousel key={category} products={shown} locale={locale} /> : <section className="product-grid" aria-label={cn ? "产品目录" : "Product catalog"}>
      {shown.map((product) => <a href={`/${locale}${product.legacyPath}`} className="product-card" key={product.id} aria-label={product.model}>
        {product.image && <img src={product.image.src} alt="" width="400" height="400" loading="lazy" />}
        <h2>{product.model}</h2><span aria-hidden="true">↗</span>
      </a>)}
    </section>}
  </>;
}
