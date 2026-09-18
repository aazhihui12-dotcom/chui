export const locales = ["en", "cn"] as const;
export type Locale = (typeof locales)[number];
export function isLocale(value: string): value is Locale {
  return value === "en" || value === "cn";
}
