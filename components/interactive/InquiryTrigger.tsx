"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/content/schema";
import { SourceButtonLabel } from "@/components/site/SourceButtonLabel";

/** General inquiry entry with a contact-page fallback when no host is mounted. */
export function InquiryTrigger({ locale, title, children, className = "lbh-button", label }: { locale: Locale; title: string; children: ReactNode; className?: string; label?: string }) {
  return <a className={`inquiry-trigger ${className}`} href={`/${locale}/Contact_Us`} aria-label={label} onClick={(event) => {
    const request = new CustomEvent("lbh:inquiry", { detail: { locale, title }, cancelable: true });
    if (!window.dispatchEvent(request)) event.preventDefault();
  }}>{className.includes("lbh-button") ? <SourceButtonLabel>{children}</SourceButtonLabel> : children}</a>;
}
