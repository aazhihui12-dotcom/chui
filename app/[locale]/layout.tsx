import type { ReactNode } from "react";
import "../globals.css";
export { metadata } from "../(entry)/layout";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/Header";
import { isLocale, locales } from "@/lib/i18n";
import { InquiryDialog } from "@/components/interactive/InquiryDialog";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <html lang={locale === "cn" ? "zh-CN" : "en"}><body><SiteShell locale={locale}>{children}<InquiryDialog locale={locale} /></SiteShell></body></html>;
}
