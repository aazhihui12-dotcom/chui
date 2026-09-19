"use client";

import type { Locale } from "@/content/schema";

export interface ProductInquiryContext { locale: Locale; productId: string; model: string; title: string }

// The shared inquiry host can preventDefault on this cancelable event to open
// its dialog. Until installed, the link remains a usable contact destination.
export function ProductInquiry({ context, label }: { context: ProductInquiryContext; label: string }) {
  return <a className="lbh-button product-inquiry" href={`/${context.locale}/Contact_Us?product=${encodeURIComponent(context.model)}`} onClick={(event) => {
    const request = new CustomEvent<ProductInquiryContext>("lbh:inquiry", { detail: context, cancelable: true });
    if (!window.dispatchEvent(request)) event.preventDefault();
  }}><svg className="product-inquiry__icon" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M4 4h16v13h-8l-4 4v-4H4z" stroke="currentColor" strokeWidth="1.3" /><path d="M8 10h1m3 0h1m3 0h1" stroke="currentColor" strokeWidth="1.5" /></svg>{label}</a>;
}
