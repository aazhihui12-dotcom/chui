import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
const source = JSON.parse(await readFile("docs/page-correspondence/source.json", "utf8")).pages;
const pairs = [];
const find = route => source.find(page => page.route === route);
const strip = href => new URL(href, "https://www.lbhappliances.com").pathname.replace(/^\/(en|cn)(?=\/)/, "");
const detailLinks = (route, kind) => [...new Map(find(route).links.filter(link => link.href.includes(`/${kind}/`)).map(link => [strip(link.href), link])).values()];
for (const page of source.filter(page => page.locale === "en" && page.model)) {
  const cn = source.find(item => item.locale === "cn" && item.model === page.model);
  if (!cn || cn.error || cn.status !== 200) throw new Error(`Missing Chinese model ${page.model}`);
  pairs.push({ en: page.path, cn: cn.path, kind: "product-detail", model: page.model });
}
for (const listing of ["/FAQ", "/NewsList/1.html"]) {
  const en = detailLinks(`/en${listing}`, "NewsDetail"), cn = detailLinks(`/cn${listing}`, "NewsDetail");
  if (en.length !== cn.length) throw new Error(`Unmatched bilingual list ${listing}`);
  for (let index = 0; index < en.length; index++) {
    const target = find(`/cn${strip(cn[index].href)}`);
    if (!target?.articleTitle || target.status !== 200 || target.error || /暂无文章/.test(target.articleTitle)) throw new Error(`Missing Chinese article ${cn[index].href}`);
    pairs.push({ en: strip(en[index].href), cn: target.path, kind: "news-detail", basis: listing === "/FAQ" ? "same FAQ position and topic" : "same source list position and publication date" });
  }
}
if (pairs.length !== 58 || new Set(pairs.map(pair => pair.cn)).size !== 58) throw new Error("Expected 24 product and 34 article pairs");
const shipped = JSON.parse(await readFile("content/shipped-assets.json", "utf8"));
const byHash = new Map(Object.entries(shipped).map(([file, hash]) => [hash, file]));
const assetMapPath = "docs/page-correspondence/assets.json";
const assetMap = await readFile(assetMapPath, "utf8").then(JSON.parse).catch(() => ({}));
const urls = [...new Set(pairs.filter(pair => pair.kind === "product-detail").flatMap(pair => {
  const product = find(`/cn${pair.cn}`).product;
  return [...product.gallery, ...product.tabs.flatMap(tab => tab.images)];
}))].filter(url => !/touming|imgbg/.test(url));
let next = 0;
await Promise.all([0, 1, 2].map(async () => {
  while (next < urls.length) {
    const url = urls[next++];
    if (assetMap[url]) continue;
    const bytes = await new Promise((resolve, reject) => {
      const child = spawn("curl", ["-f", "-L", "-sS", "--retry", "2", "--connect-timeout", "10", "--max-time", "60", url]);
      const chunks = []; child.stdout.on("data", chunk => chunks.push(chunk));
      child.on("error", reject); child.on("close", code => code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error(`Media HTTP failure ${url}`)));
    });
    const ext = bytes.subarray(0, 3).equals(Buffer.from([255,216,255])) ? ".jpg" : bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? ".png" : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? ".webp" : null;
    if (!ext) throw new Error(`Invalid source image ${url}`);
    const hash = createHash("sha256").update(bytes).digest("hex");
    const local = byHash.get(hash) || `/media/${hash}${ext}`;
    if (!byHash.has(hash)) { byHash.set(hash, local); await writeFile(`public${local}`, bytes); }
    assetMap[url] = { local, sha256: hash };
    await writeFile(assetMapPath, `${JSON.stringify(assetMap, null, 2)}\n`);
    console.log(`Source images ${Object.keys(assetMap).length}/${urls.length}`);
  }
}));
// Serialize one final complete snapshot after concurrent download workers finish.
await writeFile(assetMapPath, `${JSON.stringify(assetMap, null, 2)}\n`);
const details = {};
for (const pair of pairs) {
  const page = find(`/cn${pair.cn}`);
  const images = urls => [...new Set(urls.filter(url => !/touming|imgbg/.test(url)).map(url => assetMap[url].local))].map(src => ({ src, alt: page.model }));
  if (pair.kind === "product-detail") {
    const specifications = [];
    for (const raw of page.product.specifications.split("\n")) {
      const text = raw.replace(/\s+/g, " ").trim(); if (!text) continue;
      const index = text.search(/[:：]/);
      if (index >= 0) specifications.push({ label: text.slice(0, index).trim(), value: text.slice(index + 1).trim() });
      else if (specifications.length) specifications.at(-1).value += ` ${text}`;
    }
    details[pair.en] = { sourceUrl: page.sourceUrl, legacyPath: pair.cn, specifications, gallery: images(page.product.gallery), tabs: page.product.tabs.map(tab => ({ text: tab.text, images: images(tab.images) })) };
  } else {
    const paragraphs = page.articleParagraphs.length ? page.articleParagraphs : [page.articleIntroduction].filter(Boolean);
    details[pair.en] = { sourceUrl: page.sourceUrl, legacyPath: pair.cn, title: page.articleTitle, paragraphs, publishedAt: page.publishedAt.replace(/^发表时间[：:]\s*/, ""), author: page.author.replace(/^作者[：:]\s*/, "") };
  }
}
await writeFile("content/route-correspondence.json", `${JSON.stringify(pairs, null, 2)}\n`);
await writeFile("content/chinese-details.json", `${JSON.stringify(details, null, 2)}\n`);
console.log(`Paired ${pairs.length} real Chinese detail addresses.`);
