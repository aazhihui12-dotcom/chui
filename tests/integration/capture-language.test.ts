// @vitest-environment node
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
it.each([["en", false, "https://lbhappliances.com/cn/Company_Introduction"], ["en", true, "https://www.lbhappliances.com/cn/Company_Introduction"], ["zh", true, "https://lbhappliances.com/cn/Company_Introduction"]])("rejects fallback language %s with verified=%s at %s", async (lang, verified, resolvedUrl) => {
  const root = await mkdtemp(path.join(tmpdir(), "lbh-language-fixture-"));
  try {
    await mkdir(path.join(root, "pages"));
    await writeFile(path.join(root, "pages/en.html"), '<html lang="en"><body><main id="BodyMain1Zone"><div class="ModuleImageTextContent"><p>Company profile</p></div></main></body></html>');
    await writeFile(path.join(root, "pages/cn.html"), `<html lang="${lang}"><body><main id="BodyMain1Zone"><div class="ModuleImageTextContent"><p>Company profile</p></div></main></body></html>`);
    await writeFile(path.join(root, "manifest.json"), JSON.stringify({ assets: [], pages: [{ pathname: "/Company_Introduction", url: "https://www.lbhappliances.com/Company_Introduction", kind: "content", localeVariants: [{ locale: "en", status: 200, cacheFile: "pages/en.html", resolvedUrl: "https://www.lbhappliances.com/en/Company_Introduction" }, { locale: "cn", status: 200, cacheFile: "pages/cn.html", resolvedUrl, languageVerified: verified }] }] }));
    const result = spawnSync(process.execPath, ["scripts/build-content.mjs", "--source", root, "--output", path.join(root, "content"), "--public", path.join(root, "public")], { encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unverified canonical Chinese content");
  } finally { await rm(root, { recursive: true, force: true }); }
});
