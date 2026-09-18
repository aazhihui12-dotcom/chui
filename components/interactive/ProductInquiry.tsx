"use client";

import type { Locale } from "@/content/schema";

export interface ProductInquiryContext { locale: Locale; productId: string; model: string; title: string }

// The shared inquiry host can preventDefault on this cancelable event to open
// its dialog. Until installed, the link remains a usable contact destination.
export function ProductInquiry({ context, label }: { context: ProductInquiryContext; label: string }) {
  return <a className="lbh-button product-inquiry" href={`/${context.locale}/Contact_Us?product=${encodeURIComponent(context.model)}`} onClick={(event) => {
    const request = new CustomEvent<ProductInquiryContext>("lbh:inquiry", { detail: context, cancelable: true });
    if (!window.dispatchEvent(request)) event.preventDefault();
  }}>{label}<span aria-hidden="true">↗</span></a>;
}
