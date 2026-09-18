"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getAlternatePath } from "@/lib/routes";

function currentSlug(): string[] {
  return window.location.pathname.split("/").filter(Boolean).slice(1);
}

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const [href, setHref] = useState(() => getAlternatePath(locale, []));
  const label = locale === "en" ? "中文" : "English";

  useEffect(() => {
    setHref(getAlternatePath(locale, currentSlug()));
  }, [locale]);

  return <a className="language-switch" href={href} lang={locale === "en" ? "zh-CN" : "en"}>{label}</a>;
}
