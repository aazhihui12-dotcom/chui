"use client";

import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/content/site";
import { InquiryTrigger } from "@/components/interactive/InquiryTrigger";

export function FloatingActions({ locale }: { locale: Locale }) {
  const { contact, labels } = siteConfig[locale];

  return (
    <aside className="floating-actions" aria-label={locale === "cn" ? "快捷操作" : "Quick actions"}>
      <a className="floating-actions__home" href={`/${locale}`} aria-label={locale === "cn" ? "首页" : "Home"}><span aria-hidden="true">⌂</span><small>{locale === "cn" ? "首页" : "Home"}</small></a>
      <a className="floating-actions__whatsapp" href={`https://wa.me/${contact.whatsapp.replace("+", "")}`} aria-label="WhatsApp">⌕</a>
      <InquiryTrigger locale={locale} title={labels.inquiry} className="" label={labels.contact}><span aria-hidden="true">✉</span><small>{labels.contact}</small></InquiryTrigger>
      <button aria-label={labels.backToTop} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} type="button"><span aria-hidden="true">↑</span><small>{locale === "cn" ? "置顶" : "Pinned"}</small></button>
    </aside>
  );
}
