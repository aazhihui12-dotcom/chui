"use client";

import type { Locale } from "@/content/schema";

export function ContactInquiry({ locale, title, label, email }: { locale: Locale; title: string; label: string; email: string }) {
  return <a className="lbh-button" href={`mailto:${email}`} onClick={(event) => {
    const request = new CustomEvent("lbh:inquiry", { detail: { locale, title }, cancelable: true });
    if (!window.dispatchEvent(request)) event.preventDefault();
  }}>{label}<span aria-hidden="true">↗</span></a>;
}
