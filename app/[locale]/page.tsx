import { locales } from "@/lib/i18n";

// Task 4 route fixture: Task 5 replaces this shell-only page with HomeTemplate.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleShellEntry() {
  return (
    <main id="main-content" tabIndex={-1}>
      <span className="sr-only">LBH Appliances</span>
    </main>
  );
}
