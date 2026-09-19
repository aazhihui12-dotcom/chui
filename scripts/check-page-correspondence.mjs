import { readFile, writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
const source = JSON.parse(await readFile("docs/page-correspondence/source.json", "utf8")).pages;
const pairs = JSON.parse(await readFile("content/route-correspondence.json", "utf8"));
const manifest = JSON.parse(await readFile("source-cache/manifest.json", "utf8"));
const paths = [...new Set(manifest.sitemapUrls.map(url => new URL(url).pathname.replace(/\/$/, "") || "/"))];
const normalize = text => (text || "").replace(/\s+/g, "").toLowerCase();
const canonicalPath = (path, locale) => `/${locale}${path === "/" ? "" : pairs.find(pair => pair.en === path || pair.cn === path)?.[locale] ?? path}`;
const errors = [], rows = [];
for (const path of paths) {
  for (const locale of ["en", "cn"]) {
    const route = canonicalPath(path, locale);
    const captured = source.find(page => page.route === route);
    const failures = [];
    let title = "";
    try {
      const dom = new JSDOM(await readFile(`out${route}/index.html`, "utf8"));
      const doc = dom.window.document, main = doc.querySelector("main");
      title = main?.querySelector("h1")?.textContent || doc.title;
      if (!main) failures.push("缺少主体");
      if (doc.documentElement.lang !== (locale === "cn" ? "zh-CN" : "en")) failures.push("语言错误");
      if (new URL(doc.querySelector('link[rel="canonical"]').href).pathname !== `${route}/`) failures.push("规范地址错误");
      for (const [lang, targetLocale] of [["en", "en"], ["zh-CN", "cn"]]) {
        const target = doc.querySelector(`link[hreflang="${lang}"]`)?.href;
        if (!target || new URL(target).pathname !== `${canonicalPath(path, targetLocale)}/`) failures.push(`${lang} 配对错误`);
      }
      if (!captured || captured.error) failures.push("缺少来源证据");
      if (captured?.model && !normalize(main?.textContent).includes(normalize(captured.model))) failures.push("产品型号不符");
      if (captured?.articleTitle && path.includes("NewsDetail") && !normalize(title).includes(normalize(captured.articleTitle))) {
        // English source placeholder pages contain Chinese labels; tracked separately from identity.
        if (captured.articleTitle !== "标题") failures.push("文章标题不符");
      }
      for (const link of doc.querySelectorAll('a[href]')) {
        const href = link.getAttribute("href");
        if (/^\/cn\/(ProductDetail|NewsDetail)\//.test(href) && pairs.some(pair => `/cn${pair.en}` === href.replace(/\/$/, ""))) failures.push(`仍链接旧中文编号 ${href}`);
      }
      dom.window.close();
    } catch (error) { failures.push(error.message); }
    const row = { route, title, sourceUrl: captured?.sourceUrl, sourceStatus: captured?.status, status: failures.length ? "FAIL" : "PASS", failures, visual: "尚未逐像素验收" };
    rows.push(row); errors.push(...failures.map(error => `${route}: ${error}`));
  }
}
for (const pair of pairs) {
  const dom = new JSDOM(await readFile(`out/cn${pair.en}/index.html`, "utf8"));
  if (new URL(dom.window.document.querySelector('link[rel="canonical"]').href).pathname !== `/cn${pair.cn}/`) errors.push(`旧中文入口未对应 ${pair.en}`);
  dom.window.close();
}
await writeFile("docs/page-correspondence/report.json", JSON.stringify({ checkedAt: new Date().toISOString(), canonicalPages: rows.length, compatibilityPages: pairs.length, errors, pages: rows }, null, 2) + "\n");
const base = "https://lbh-appliances-bilingual.gentle-slug-7609.chatgpt.site";
await writeFile("docs/page-correspondence/README.md", `# 逐页对应核验\n\n共 ${rows.length} 个规范页面、${pairs.length} 个旧中文兼容入口。核验范围：导出文件、语言、规范地址、中英文配对、详情身份与旧地址链接；不代表视觉逐像素一致。邮箱发送仍按约定未接入。\n\n| 原站页面 | 复刻页面 | 路径及身份核验 |\n| --- | --- | --- |\n${rows.map(row => `| [${row.route}](${row.sourceUrl}) | [查看](${base}${row.route}/) | ${row.status} |`).join("\n")}\n`);
console.log(`${rows.length} canonical pages, ${pairs.length} compatibility pages; ${errors.length} errors.`);
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
