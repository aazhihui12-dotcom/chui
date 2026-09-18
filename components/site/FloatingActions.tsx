"use client";

import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/content/site";

export function FloatingActions({ locale }: { locale: Locale }) {
  const { contact, labels } = siteConfig[locale];

  return (
    <aside className="floating-actions" aria-label={locale === "cn" ? "快捷操作" : "Quick actions"}>
      <a href={`https://wa.me/${contact.whatsapp.replace("+", "")}`} aria-label="WhatsApp">⌕</a>
      <a href={`/${locale}/Contact`} aria-label={labels.contact}>✉</a>
      <button aria-label={labels.backToTop} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} type="button">↑</button>
    </aside>
  );
}
