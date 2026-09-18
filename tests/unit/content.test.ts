import { products } from "@/content/products";
import { articles } from "@/content/articles";
import { allPages, getPage } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import manifest from "@/source-cache/manifest.json";

it("accepts only supported route locales", () => {
  expect(isLocale("en")).toBe(true);
  expect(isLocale("cn")).toBe(true);
  expect(isLocale("fr")).toBe(false);
  expect(isLocale("zh")).toBe(false);
});

it("retains every product and article in both languages", () => {
  expect(products).toHaveLength(24);
  expect(articles).toHaveLength(34);
  for (const record of [...products, ...articles]) {
    expect(record.locales.en.locale).toBe("en");
    expect(record.locales.cn.locale).toBe("cn");
    expect(record.locales.cn.description).toMatch(/[\u4e00-\u9fff]/);
  }
});

it("resolves every unique captured route without duplicate locale pages", () => {
  const paths = [...new Set(manifest.pages.map((page) => page.pathname))];
  expect(allPages).toHaveLength(paths.length * 2);
  for (const path of paths) {
    for (const locale of ["en", "cn"] as const) {
      expect(getPage(locale, path.split("/").filter(Boolean))?.blocks.length).toBeGreaterThan(0);
    }
  }
  expect(getPage("en", ["missing-page"])).toBeUndefined();
});

it("preserves source model and specification values through localization", () => {
  const product = products.find((item) => item.id === "11906944")!;
  expect(product.model).toBe("LBH-3228");
  expect(product.locales.en.specifications).toContainEqual({ label: "Wattage", value: "86W" });
  expect(product.locales.cn.specifications).toContainEqual({ label: "功率", value: "86W" });
  expect(product.locales.cn.specifications.map((item) => item.value))
    .toEqual(product.locales.en.specifications.map((item) => item.value));
});

it("records generated Chinese translations without claiming verified Chinese source", () => {
  for (const slug of [["ProductDetail", "11906944.html"], ["NewsDetail", "6860195.html"]]) {
    const page = getPage("cn", slug)!;
    expect(page.provenance.sourceLocale).toBe("en");
    expect(page.provenance.translation).toBe("authored");
    expect(page.provenance.languageVerified).toBe(false);
    expect(page.description).toMatch(/[\u4e00-\u9fff]/);
  }
});

it("publishes structured safe blocks and local media instead of source markup", () => {
  expect(JSON.stringify(allPages)).not.toMatch(/<script|onclick=|javascript:|ModuleItem|google_translate_element/i);
  const types = new Set(["hero", "rich-text", "media", "split", "stats", "gallery", "timeline", "cta"]);
  for (const page of allPages) {
    expect(page.title.length).toBeGreaterThan(0);
    expect(page.blocks.every((block) => types.has(block.type))).toBe(true);
    expect(page.images.every((image) => image.src.startsWith("/media/"))).toBe(true);
  }
});

it("retains table-based specifications and each product's captured category", () => {
  const product = products.find((item) => item.id === "11906927")!;
  expect(product.locales.cn.specifications).toContainEqual({ label: "功率", value: "1400W" });
  expect(product.locales.en.specifications).toContainEqual({ label: "Heater", value: "PCT" });
  expect(products.every((product) => product.categoryId && product.gallery.length > 0)).toBe(true);
});

it("keeps FAQ answers and explicitly identifies source placeholder articles", () => {
  const faq = articles.find((article) => article.id === "6860211")!;
  expect(faq.locales.en.description).toBe("1300W-2000W");
  expect(faq.locales.cn.description).toContain("1300W-2000W");
  expect(articles.filter((article) => article.locales.en.provenance.coverage === "source-placeholder")).toHaveLength(11);
});

it("localizes every milestone and retains homepage statistics in Chinese", () => {
  const milestone = getPage("cn", ["Milestone"])!.blocks.find((block) => block.type === "timeline")!;
  expect(milestone.items).toHaveLength(7);
  expect(milestone.items.find((item) => item.year === "2026")!.description).toMatch(/[\u4e00-\u9fff]/);
  const stats = getPage("cn", [])!.blocks.filter((block) => block.type === "stats").flatMap((block) => block.items);
  expect(stats).toContainEqual({ value: "4800 +", label: "成功的客制样品" });
});

it("provides Chinese labels for every captured call to action", () => {
  const labels = allPages.filter((page) => page.locale === "cn").flatMap((page) => page.blocks.flatMap((block) => "actions" in block ? (block.actions ?? []).map((action) => action.label) : []));
  expect(labels.filter((label) => /^[A-Za-z]/.test(label))).toEqual([]);
});

it("keeps milestone event titles separate from their year", () => {
  const timeline = getPage("en", ["Milestone"])!.blocks.find((block) => block.type === "timeline")!;
  expect(timeline.items[0].title).toBe("Passionate Entrepreneurship");
  expect(timeline.items.every((item) => item.title !== item.year)).toBe(true);
  expect(timeline.items[0].description).toMatch(/^Recognizing/);
});

it("retains all six captured certificate images despite unreliable MIME metadata", () => {
  for (const locale of ["en", "cn"] as const) {
    const page = getPage(locale, ["Certification_certificate"])!;
    expect(page.images).toHaveLength(6);
    const gallery = page.blocks.filter((block) => block.type === "gallery").flatMap((block) => block.images);
    expect(gallery).toHaveLength(6);
    expect(gallery.map((image) => image.src)).toContain("/media/890c21701bc0f9c2b752e3b892b8a74630a3fc4c70da6dd8cf62b62da4ccd558.webp");
  }
});

it("preserves the homepage catalogue button's captured contact destination", () => {
  const actions = getPage("en", [])!.blocks.filter((block) => block.type === "cta").flatMap((block) => block.actions);
  expect(actions).toContainEqual({ label: "Request Full Product Catalog", href: "/en/Contact_Us", action: "inquiry" });
});

it("keeps Chinese catalogue inquiries and empty source contact links in Chinese", () => {
  const homeActions = getPage("cn", [])!.blocks.filter((block) => block.type === "cta").flatMap((block) => block.actions);
  expect(homeActions).toContainEqual({ label: "索取完整产品目录", href: "/cn/Contact_Us", action: "inquiry" });
  const sourceActions = getPage("cn", ["Content", "3012462.html"])!.blocks.filter((block) => block.type === "cta").flatMap((block) => block.actions);
  expect(sourceActions).toContainEqual({ label: "索取完整产品目录", href: "/cn/Contact_Us", action: "inquiry" });
  for (const page of allPages.filter((page) => page.locale === "cn")) {
    for (const block of page.blocks) {
      if (block.type === "cta") expect(block.actions.every((action) => !action.href.startsWith("/en/"))).toBe(true);
    }
  }
});
