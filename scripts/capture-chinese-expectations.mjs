// Explicit capture maintenance command; normal tests only read the committed fixture.
import { readFile, writeFile } from "node:fs/promises";
import { JSDOM, VirtualConsole } from "jsdom";
const manifest = JSON.parse(await readFile("source-cache/manifest.json", "utf8"));
const expectations = {};
for (const page of manifest.pages.filter(page => !["product-detail", "news-detail"].includes(page.kind))) {
  const variant = page.localeVariants.find(variant => variant.locale === "cn");
  if (!variant.languageVerified || variant.status !== 200) continue;
  const document = new JSDOM(await readFile(`source-cache/${variant.cacheFile}`, "utf8"), { virtualConsole: new VirtualConsole() }).window.document;
  const paragraphs = [...document.querySelectorAll("#BodyMain1Zone .ModuleImageTextContent p, #BodyMain1Zone .ModuleImageTextContent li, #BodyMain1Zone .ModuleImageTextContent h1, #BodyMain1Zone .ModuleImageTextContent h2, #BodyMain1Zone .ModuleImageTextContent h3, #BodyMain1Zone .ModuleImageTextContent h4")]
    .filter(node => !node.querySelector("p,li,h1,h2,h3,h4"))
    .map(node => node.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
  expectations[page.pathname] = { sourceUrl: variant.resolvedUrl, paragraphs: [...new Set(paragraphs)] };
}
await writeFile("tests/fixtures/chinese-source-content.json", `${JSON.stringify(expectations, null, 2)}\n`);
