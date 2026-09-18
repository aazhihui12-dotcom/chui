import type { Locale } from "@/lib/i18n";
export type { Locale } from "@/lib/i18n";

export interface ImageAsset { src: string; alt: string; width?: number; height?: number }
export interface Action { label: string; href: string; action?: "inquiry" | "download" }
export interface HeroBlock { type: "hero"; title: string; subtitle?: string; image?: ImageAsset; actions?: Action[] }
export interface RichTextBlock { type: "rich-text"; heading?: string; paragraphs: string[]; items?: string[] }
export interface MediaBlock { type: "media"; image: ImageAsset; caption?: string; videoUrl?: string }
export interface SplitBlock { type: "split"; heading: string; paragraphs: string[]; image: ImageAsset; imagePosition?: "left" | "right"; actions?: Action[] }
export interface StatsBlock { type: "stats"; items: { value: string; label: string }[] }
export interface GalleryBlock { type: "gallery"; heading?: string; images: ImageAsset[]; presentation?: "hover" }
export interface TimelineBlock { type: "timeline"; items: { year: string; title: string; description: string }[] }
export interface CtaBlock { type: "cta"; heading?: string; description?: string; actions: Action[] }
export type ContentBlock = HeroBlock | RichTextBlock | MediaBlock | SplitBlock | StatsBlock | GalleryBlock | TimelineBlock | CtaBlock;

export interface Provenance {
  sourceUrl: string;
  sourceLocale: "en" | "cn";
  languageVerified: boolean;
  translation: "none" | "authored";
  coverage: "full" | "localized-summary" | "source-placeholder";
}
export type PageKind = "home" | "content" | "product-index" | "product-category" | "product-detail" | "news-list" | "news-detail" | "contact" | "download";
export interface SitePage {
  id: string; locale: Locale; legacyPath: string; kind: PageKind;
  title: string; description: string; seo: { title: string; description: string };
  blocks: ContentBlock[]; images: ImageAsset[]; provenance: Provenance;
  productId?: string; articleId?: string; categoryId?: string; downloads?: Action[];
}
export interface Specification { label: string; value: string }
export interface ProductPage extends SitePage {
  model: string; categoryId: string; specifications: Specification[];
  features: ContentBlock[]; accessories: ContentBlock[]; inquiryTitle: string;
}
export interface Product { id: string; model: string; legacyPath: string; categoryId: string; image?: ImageAsset; gallery: ImageAsset[]; locales: Record<Locale, ProductPage> }
export interface ArticlePage extends SitePage { publishedAt: string; author: string; category: "faq" | "news" }
export interface Article { id: string; legacyPath: string; publishedAt: string; author: string; category: "faq" | "news"; locales: Record<Locale, ArticlePage> }
export interface Category { id: string; legacyPath: string; title: Record<Locale, string>; productIds: string[]; image?: ImageAsset }
export interface NavigationItem { label: string; href: string; children?: NavigationItem[] }
export interface SiteConfig {
  name: string; locale: Locale; logo?: ImageAsset; navigation: NavigationItem[];
  contact: { phone: string; email: string; whatsapp: string; company: string; address: string };
  labels: { inquiry: string; catalogue: string; contact: string; menu: string; close: string; backToTop: string; products: string; news: string; specifications: string; features: string; accessories: string };
}
