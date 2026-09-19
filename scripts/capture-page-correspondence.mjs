// Explicit, resumable source verification. No source HTML/scripts enter the app.
import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const output = "docs/page-correspondence/source.json";
const manifest = JSON.parse(await readFile("source-cache/manifest.json", "utf8"));
const paths = [...new Set(manifest.pages.map(page => page.pathname))];
await mkdir("docs/page-correspondence", { recursive: true });
const previous = process.argv.includes("--fresh") ? {} : await readFile(output, "utf8").then(JSON.parse).catch(() => ({}));
const records = previous.pages || [];
const jobs = paths.flatMap(path => ["en", "cn"].map(locale => ({ path, locale, route: `/${locale}${path === "/" ? "" : path}` }))).filter(job => !records.some(record => record.route === job.route && !record.error));
const known = new Set([...jobs, ...records.filter(record => !record.error)].map(record => record.route));
function discover(record) {
  for (const link of record.links || []) {
    let url;
    try { url = new URL(link.href, record.sourceUrl); } catch { continue; }
    if (!/^(www\.)?lbhappliances\.com$/.test(url.hostname) || !/^\/(en|cn)\/(ProductDetail|NewsDetail)\/\d+\.html$/.test(url.pathname) || known.has(url.pathname)) continue;
    known.add(url.pathname);
    const locale = url.pathname.split("/")[1];
    jobs.push({ path: url.pathname.replace(/^\/(en|cn)/, ""), locale, route: url.pathname });
  }
}
records.forEach(discover);
const browser = await chromium.launch({ channel: "chrome" });
let next = 0;
try {
  await Promise.all([0, 1].map(async () => {
    const context = await browser.newContext({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", viewport: { width: 1440, height: 1200 }, reducedMotion: "reduce" });
    await context.route("**/*", route => route.request().resourceType() !== "document" ? route.abort() : route.continue());
    while (next < jobs.length) {
      const job = jobs[next++];
      const page = await context.newPage();
      let record = { ...job, sourceUrl: `https://www.lbhappliances.com${job.route}`, checkedAt: new Date().toISOString() };
      try {
        const response = await page.goto(record.sourceUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
        record = { ...record, status: response.status(), resolvedUrl: page.url(), ...await page.evaluate(() => {
          const root = document.querySelector("#BodyMain1Zone") || document.body;
          const clean = text => (text || "").replace(/\s+/g, " ").trim();
          const text = clean(root.innerText);
          const paragraphs = [...root.querySelectorAll(".ModuleImageTextContent p, .ModuleImageTextContent li, .ModuleImageTextContent h1, .ModuleImageTextContent h2, .ModuleImageTextContent h3, .ModuleImageTextContent h4")].filter(node => !node.querySelector("p,li,h1,h2,h3,h4")).map(node => clean(node.textContent)).filter(Boolean);
          const links = [...root.querySelectorAll("a[href]")].map(node => ({ text: clean(node.textContent), href: node.getAttribute("href") }));
          const imageUrls = node => [...(node?.querySelectorAll("img") || [])].map(image => image.getAttribute("data-src") || image.getAttribute("src")).filter(Boolean).map(url => new URL(url, location.href).href);
          const article = root.querySelector("#readMore article");
          const intro = document.querySelector(".news-introduction-deail");
          return { title: document.title, language: document.documentElement.lang, text, paragraphs: [...new Set(paragraphs)], model: clean(root.querySelector("h1.pro-name")?.textContent), articleTitle: clean(root.querySelector(".newsDetailTitle")?.textContent), articleParagraphs: [...(article?.querySelectorAll("p") || [])].map(node => clean(node.textContent)).filter(Boolean), articleIntroduction: clean(intro?.textContent), publishedAt: clean(document.querySelector(".PublishTime")?.textContent), author: clean(document.querySelector(".Author")?.textContent), product: { specifications: root.querySelector(".params-content")?.innerText || "", gallery: imageUrls(root.querySelector(".gallery-top")), tabs: [...root.querySelectorAll(".particularsMain .tab-pane")].map(node => ({ text: clean(node.innerText), images: imageUrls(node) })) }, links };
        }) };
        if (/HeadlessChrome blocked|Access Denied/i.test(record.text)) throw new Error("Source denied browser request");
      } catch (error) { record.error = String(error); }
      discover(record);
      records.splice(0, records.length, ...records.filter(old => old.route !== job.route), record);
      await writeFile(output, `${JSON.stringify({ checkedAt: new Date().toISOString(), pages: records.sort((a, b) => a.route.localeCompare(b.route)) }, null, 2)}\n`);
      console.log(`${records.length}/${known.size} ${record.status || "ERROR"} ${job.route}${record.error ? ` ${record.error}` : ""}`);
      await page.close();
    }
    await context.close();
  }));
} finally { await browser.close(); }
await writeFile(output, `${JSON.stringify({ checkedAt: new Date().toISOString(), pages: records.sort((a, b) => a.route.localeCompare(b.route)) }, null, 2)}\n`);
