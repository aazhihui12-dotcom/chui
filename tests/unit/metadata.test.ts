import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { generateMetadata } from "@/app/[locale]/[...slug]/page";
import * as home from "@/app/[locale]/page";
import { getPage } from "@/lib/content";
import { act, createElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { render, screen, cleanup } from "@testing-library/react";
import { allPages } from "@/lib/content";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import NotFound from "@/components/site/NotFound";
import pairs from "@/content/route-correspondence.json";

const navigation = vi.hoisted(() => ({ pathname: "/en/unknown" }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...await importOriginal<typeof import("next/navigation")>(),
  usePathname: () => navigation.pathname,
}));
beforeEach(() => vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined));
afterEach(() => vi.unstubAllEnvs());

it.each(["en", "cn"] as const)("gives %s content a self canonical and both language equivalents", async (locale) => {
  const result = await generateMetadata({ params: Promise.resolve({ locale, slug: ["ProductDetail", "11906944.html"] }) });
  expect(result).toMatchObject({
    title: getPage(locale, ["ProductDetail", "11906944.html"])!.seo.title,
    alternates: {
      canonical: `http://localhost:3000/${locale}/ProductDetail/${locale === "cn" ? "11898269" : "11906944"}.html/`,
      languages: {
        en: "http://localhost:3000/en/ProductDetail/11906944.html/",
        "zh-CN": "http://localhost:3000/cn/ProductDetail/11898269.html/",
        "x-default": "http://localhost:3000/en/ProductDetail/11906944.html/",
      },
    },
  });
});

it("gives each home page its own content metadata and canonical", async () => {
  expect(home).toHaveProperty("generateMetadata", expect.any(Function));
  for (const locale of ["en", "cn"] as const) {
    const result = await home.generateMetadata({ params: Promise.resolve({ locale }) });
    expect(result).toMatchObject({
      title: getPage(locale, [])!.seo.title,
      description: getPage(locale, [])!.seo.description,
      alternates: { canonical: `http://localhost:3000/${locale}/` },
    });
  }
});

it("lists all 194 locale pages once with their reciprocal language URLs", () => {
  const entries = sitemap();
  expect(entries).toHaveLength(194);
  expect(new Set(entries.map(entry => entry.url)).size).toBe(194);
  for (const page of allPages) {
    const pathname = page.legacyPath === "/" ? "" : page.legacyPath;
    const pair = pairs.find(pair => pair.en === pathname || pair.cn === pathname);
    expect(entries).toContainEqual({
      url: `http://localhost:3000/${page.locale}${pathname}/`,
      alternates: { languages: {
        en: `http://localhost:3000/en${pair?.en ?? pathname}/`,
        "zh-CN": `http://localhost:3000/cn${pair?.cn ?? pathname}/`,
        "x-default": `http://localhost:3000/en${pair?.en ?? pathname}/`,
      } },
    });
  }
});

it("publishes robots rules with the current site's sitemap URL", () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.test/");
  try {
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/" }, sitemap: "https://preview.example.test/sitemap.xml" });
  } finally { vi.unstubAllEnvs(); }
});

it.each([
  ["/cn/ProductDetail/unknown.html", "页面未找到", "/cn"],
  ["/en/NewsDetail/unknown.html", "Page not found", "/en"],
  ["/unknown", "Page not found", "/en"],
])("gives unknown path %s a localized 404 and a working home link", (pathname, title, homePath) => {
  navigation.pathname = pathname;
  render(createElement(NotFound));
  expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  expect(screen.getByRole("link").getAttribute("href")).toBe(homePath);
  cleanup();
});

it("hydrates a shared static 404 at a Chinese URL without a server/client text mismatch", async () => {
  navigation.pathname = "/_not-found";
  const container = document.createElement("div");
  container.innerHTML = renderToString(createElement(NotFound));
  document.body.append(container);
  navigation.pathname = "/cn/missing-page";
  const errors: unknown[] = [];
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, createElement(NotFound), { onRecoverableError: error => errors.push(error) });
    });
    expect(container.querySelector("h1")?.textContent).toBe("页面未找到");
    expect(errors).toEqual([]);
  } finally {
    await act(async () => root?.unmount());
    container.remove();
  }
});

it("uses the configured deployment origin rather than the captured source origin", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://lbh-preview.example.test/subpath?ignored=1");
  try {
    const result = await generateMetadata({ params: Promise.resolve({ locale: "cn", slug: ["FAQ"] }) });
    expect(result.alternates?.canonical).toBe("https://lbh-preview.example.test/cn/FAQ/");
  } finally {
    vi.unstubAllEnvs();
  }
});
