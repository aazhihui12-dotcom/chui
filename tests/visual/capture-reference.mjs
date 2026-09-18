import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const routes = ["/en", "/cn", "/en/ProductIndex", "/en/ProductDetail/11906944.html", "/cn/ProductDetail/11906921.html", "/en/Company_Introduction", "/en/NewsDetail/6860217.html", "/cn/Contact_Us"];
const browser = await chromium.launch({ channel: "chrome" });
const captures = [];
await mkdir("tests/visual/reference", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: width === 1440 ? 1200 : 844 },
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      reducedMotion: "reduce",
    });
    for (const route of routes) {
      const url = `https://www.lbhappliances.com${route}`;
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(3000);
      if ((await page.locator("body").innerText()).includes("HeadlessChrome blocked")) throw new Error(`Source blocked ${url}`);
      const name = `${route.slice(1).replaceAll("/", "-")}-${width}.png`;
      await page.screenshot({ path: `tests/visual/reference/${name}`, animations: "disabled" });
      captures.push({ route, width, url: page.url(), status: response.status(), title: await page.title(), filename: name });
      console.log(`${response.status()} ${name}`);
    }
    await page.close();
  }
  await writeFile("tests/visual/reference/capture.json", JSON.stringify({ capturedAt: new Date().toISOString(), captures }, null, 2) + "\n");
} finally {
  await browser.close();
}
