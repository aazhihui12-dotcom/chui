import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { HomeTemplate } from "@/components/templates/HomeTemplate";
import { pageMetadata } from "@/lib/metadata";
import { getCatalog, getRuntimePage } from "@/runtime/lib/catalog";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = getRuntimePage(locale, []);
  if (!page) notFound();
  return pageMetadata(page);
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = getRuntimePage(locale, []);
  if (!page) notFound();
  return <HomeTemplate page={page} catalogProducts={getCatalog().products} />;
}
