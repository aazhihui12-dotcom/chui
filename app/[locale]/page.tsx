import { locales, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";
import { HomeTemplate } from "@/components/templates/HomeTemplate";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = getPage(locale, []);
  if (!page) notFound();
  return pageMetadata(page);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = getPage(locale, []);
  if (!page) notFound();
  return <HomeTemplate page={page} />;
}
