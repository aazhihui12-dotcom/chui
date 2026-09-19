import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import * as content from "@/lib/content";
import ContentPage, { generateMetadata, generateStaticParams } from "@/app/[locale]/[...slug]/page";

it("exports exactly 68 unique localized article detail paths, all included in static generation", () => {
  expect(content).toHaveProperty("articleStaticParams", expect.any(Function));
  const params = (content as typeof content & { articleStaticParams: () => Array<{locale: string; slug: string[]}> }).articleStaticParams();
  expect(params).toHaveLength(68);
  expect(new Set(params.map(p => `${p.locale}/${p.slug.join("/")}`)).size).toBe(68);
  expect(params).toContainEqual({ locale: "en", slug: ["NewsDetail", "6860206.html"] });
  expect(params).toContainEqual({ locale: "cn", slug: ["NewsDetail", "6724244.html"] });
  for (const param of params) expect(generateStaticParams()).toContainEqual(param);
});

it("dispatches all 68 existing detail records with their own metadata and a single heading", async () => {
  const details = content.allPages.filter(page => page.kind === "news-detail");
  expect(details).toHaveLength(68);
  for (const page of details) {
    const params = Promise.resolve({ locale: page.locale, slug: page.legacyPath.split("/").filter(Boolean) });
    const html = renderToStaticMarkup(await ContentPage({ params }));
    expect(html, page.legacyPath).toContain('class="article-detail');
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toContain("LBH APPLIANCES");
    expect(await generateMetadata({ params })).toMatchObject({ title: page.seo.title, description: page.seo.description });
  }
});

it.each([
  ["Blog", "article-list"], ["NewsList/1.html", "article-list"], ["NewsList/2.html", "article-list"],
  ["FAQ", "faq-page"], ["Contact", "contact-page"], ["Contact_Us", "contact-page"],
  ["Product_Catalogue", "downloads-page"], ["DownLoad/261888.html", "downloads-page"],
  ["DownLoad/261889.html", "downloads-page"], ["DownLoad/261890.html", "downloads-page"], ["DownLoad/261891.html", "downloads-page"],
])("statically renders both locales of %s with the dedicated template", async (path, template) => {
  for (const locale of ["en", "cn"] as const) {
    const slug = path.split("/");
    expect(content.getPage(locale, slug)).toBeDefined();
    expect(generateStaticParams()).toContainEqual({ locale, slug });
    const html = renderToStaticMarkup(await ContentPage({ params: Promise.resolve({ locale, slug }) }));
    if (path === "Contact") {
      expect(html).toMatch(/^<main[^>]*><\/main>$/);
    } else {
      expect(html).toContain(`class="${template}`);
      expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    }
    if (path.startsWith("DownLoad")) {
      expect(html).toContain(locale === "cn" ? "暂无可下载文件" : "No downloadable files are currently available");
      expect(html).not.toContain("a=download");
    }
  }
});
