// @vitest-environment node
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, expect, it } from "vitest";
import manifest from "@/source-cache/manifest.json";
import { generateStaticParams } from "@/app/[locale]/[...slug]/page";
import { generateStaticParams as homeParams } from "@/app/[locale]/page";

const temporaryDirectories: string[] = [];
const uniqueSourcePaths = [...new Set(manifest.sitemapUrls.map(url => new URL(url).pathname.replace(/\/$/, "") || "/"))];
const command = (output: string, ...args: string[]) => spawnSync(process.execPath, ["scripts/check-routes.mjs", "--output", output, "--manifest", "source-cache/manifest.json", ...args], { encoding: "utf8" });

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});

it("registers both locales of every unique captured source path", () => {
  const exportedPaths = [
    ...homeParams().map(({ locale }) => `/${locale}`),
    ...generateStaticParams().map(({ locale, slug }) => `/${locale}/${slug.join("/")}`),
  ];
  expect(uniqueSourcePaths).toHaveLength(97);
  expect(new Set(exportedPaths).size).toBe(194);
  for (const sourcePath of uniqueSourcePaths) {
    for (const locale of ["en", "cn"]) expect(exportedPaths).toContain(`/${locale}${sourcePath === "/" ? "" : sourcePath}`);
  }
});

async function exportedFixture() {
  const output = await mkdtemp(path.join(tmpdir(), "lbh-route-test-"));
  temporaryDirectories.push(output);
  for (const pathname of uniqueSourcePaths) {
    for (const locale of ["en", "cn"]) {
      const directory = path.join(output, locale, pathname === "/" ? "" : pathname);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, "index.html"), '<html><body><a href="/en/FAQ/?from=test#questions">FAQ</a><a href="https://outside.example/test">External</a><a href="mailto:test@example.com">Email</a></body></html>');
    }
  }
  return output;
}

it("writes usable static legacy redirects for all 97 paths and passes route validation", async () => {
  const output = await exportedFixture();
  const generated = command(output, "--generate-legacy");
  expect(generated.status, generated.stderr).toBe(0);
  for (const pathname of uniqueSourcePaths) {
    const html = await readFile(path.join(output, pathname === "/" ? "" : pathname, "index.html"), "utf8");
    const target = `/en${pathname === "/" ? "" : pathname}/`;
    expect(html).toContain(`http-equiv="refresh" content="0;url=${target}"`);
    expect(html).toContain(`href="${target}"`);
    expect(html).toContain("location.replace(");
    expect(html).toContain("location.search + location.hash");
  }
  const checked = command(output);
  expect(checked.status, checked.stderr).toBe(0);
  expect(checked.stdout).toContain("194 localized pages, 97 legacy redirects");
});

it("fails for a missing localized export, a corrupt redirect, and a broken internal link", async () => {
  const output = await exportedFixture();
  expect(command(output, "--generate-legacy").status).toBe(0);
  await rm(path.join(output, "cn/FAQ/index.html"));
  await writeFile(path.join(output, "Contact/index.html"), '<html><body><a href="/en/FAQ/">Wrong destination</a></body></html>');
  await writeFile(path.join(output, "en/index.html"), '<a href="/en/missing-page/">Broken</a>');
  const checked = command(output);
  expect(checked.status).toBe(1);
  expect(checked.stderr).toContain("/cn/FAQ");
  expect(checked.stderr).toContain("/Contact");
  expect(checked.stderr).toContain("/en/missing-page/");
});
