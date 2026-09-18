// @vitest-environment node
import { readFileSync, existsSync } from "node:fs";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import * as pages from "@/content/pages";
import * as products from "@/content/products";
import * as articles from "@/content/articles";
import * as home from "@/content/home";
import * as site from "@/content/site";
import * as editorial from "@/content/editorial";

const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map(dir => rm(dir, { recursive: true, force: true }))); });
const sha = (data: Buffer) => createHash("sha256").update(data).digest("hex");
const run = (...args: string[]) => spawnSync(process.execPath, ["scripts/check-assets.mjs", ...args], { encoding: "utf8" });
function mediaPaths(value: unknown, field = "", isDownload = false): string[] {
  if (typeof value === "string") return /^(src|poster|videoUrl|manufacturingVideo|manufacturingPoster)$/.test(field) || isDownload ? [value] : [];
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return Object.entries(object).flatMap(([key, item]) => mediaPaths(item, key, key === "href" && object.action === "download"));
  }
  return [];
}

it("serves every typed-content media reference locally without byte-identical duplicate URLs", () => {
  const paths = [...new Set(mediaPaths([pages, products, articles, home, site, editorial]))];
  expect(paths.length).toBeGreaterThan(300);
  const hashes = new Map<string, string[]>();
  for (const media of paths) {
    expect(/^\/(media|downloads)\/.+/.test(media), media).toBe(true);
    const file = path.join("public", media);
    expect(existsSync(file), media).toBe(true);
    const bytes = readFileSync(file);
    expect(bytes.length, media).toBeGreaterThan(0);
    const hash = sha(bytes);
    hashes.set(hash, [...(hashes.get(hash) || []), media]);
  }
  expect([...hashes.values()].filter(group => group.length > 1)).toEqual([]);
});

it("audits real content, source provenance, and component/CSS references with zero errors", () => {
  const result = run("--public", "public", "--content", "content", "--json");
  expect(result.status, result.stderr || result.stdout).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.errors).toEqual([]);
  const typedPaths = [...new Set(mediaPaths([pages, products, articles, home, site, editorial]))];
  for (const media of typedPaths) expect(report.requiredPaths).toContain(media);
  expect(report.sourceAssets).toBe(1367);
  expect(report.unavailableSourceAssets).toHaveLength(4);
  expect(report.requiredPaths).toContain("/fonts/Poppins-Regular.woff2");
});

it("rejects missing, empty, mislabeled, tampered, duplicate, traversal and remote dependencies", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "lbh-assets-test-")); directories.push(root);
  await mkdir(path.join(root, "public/media"), { recursive: true });
  await mkdir(path.join(root, "content"));
  const png = Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c636000020000050001a5f645400000000049454e44ae426082", "hex");
  await Promise.all([
    writeFile(path.join(root, "public/media/a.png"), png),
    writeFile(path.join(root, "public/media/duplicate.png"), png),
    writeFile(path.join(root, "public/media/empty.png"), ""),
    writeFile(path.join(root, "public/media/bad.jpg"), "<html>not an image</html>"),
    writeFile(path.join(root, "public/media/wrong.jpg"), png),
    writeFile(path.join(root, "content/data.ts"), `export const data = [{src:"/media/a.png"},{src:"/media/duplicate.png"},{src:"/media/empty.png"},{src:"/media/missing.png"},{src:"/media/bad.jpg"},{src:"/media/wrong.jpg"},{src:"/media/../../outside.png"},{src:"https://lbhappliances.com/remote.png"},{action:"download",href:"https://cdn.example/catalog.pdf"}];`),
    writeFile(path.join(root, "manifest.json"), JSON.stringify({ assets: [{ sourceUrl: "https://source.example/a.png", localPath: "assets/a.png", sha256: "0".repeat(64), contentType: "image/png", status: 200, referencedBy: [] }] })),
  ]);
  const result = run("--public", path.join(root, "public"), "--content", path.join(root, "content"), "--manifest", path.join(root, "manifest.json"), "--source-roots", path.join(root, "content"), "--json");
  expect(result.status).toBe(1);
  const errors: string[] = JSON.parse(result.stdout).errors;
  for (const expected of ["missing.png", "empty.png", "bad.jpg", "wrong.jpg", "checksum", "duplicate", "outside.png", "remote.png", "catalog.pdf"]) {
    expect(errors.some(error => error.includes(expected)), `${expected}: ${errors.join("; ")}`).toBe(true);
  }
});

it("checks exported bytes and catches remote responsive image dependencies", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "lbh-assets-export-")); directories.push(root);
  for (const directory of ["public/media", "content", "out/media"]) await mkdir(path.join(root, directory), { recursive: true });
  const png = readFileSync("public/media/af0e40020b2752722aa03ed905dc909a09da480116f7a157659283eae6632ada.png");
  await Promise.all([
    writeFile(path.join(root, "public/media/test.png"), png),
    writeFile(path.join(root, "out/media/test.png"), png),
    writeFile(path.join(root, "manifest.json"), '{"assets":[]}'),
    writeFile(path.join(root, "content/data.ts"), 'export const image={src:"/media/test.png"}'),
    writeFile(path.join(root, "out/index.html"), '<img src="/media/test.png">'),
  ]);
  const args = ["--public", path.join(root, "public"), "--content", path.join(root, "content"), "--source-roots", path.join(root, "content"), "--manifest", path.join(root, "manifest.json"), "--output", path.join(root, "out"), "--json"];
  expect(run(...args).status).toBe(0);
  await writeFile(path.join(root, "out/media/test.png"), "corrupt export");
  await writeFile(path.join(root, "out/index.html"), '<img src="/media/test.png" srcset="https://lbhappliances.com/image 2x">');
  const result = run(...args);
  expect(result.status).toBe(1);
  expect(JSON.parse(result.stdout).errors).toEqual(expect.arrayContaining([
    "missing or changed exported asset: /media/test.png",
    "remote dependency: https://lbhappliances.com/image",
  ]));
});

it("keeps regenerated captured content deduplicated without copying unused source chrome", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "lbh-assets-regenerate-")); directories.push(root);
  const generated = spawnSync(process.execPath, ["scripts/build-content.mjs", "--output", path.join(root, "content"), "--public", path.join(root, "public")], { encoding: "utf8" });
  expect(generated.status, generated.stderr).toBe(0);
  const checked = run("--public", path.join(root, "public"), "--content", path.join(root, "content"), "--source-roots", path.join(root, "content"), "--json");
  expect(checked.status, checked.stdout || checked.stderr).toBe(0);
}, 60_000);

it.each(["content", "export"])("rejects wrong-prefix and relative media in %s without treating scripts or navigation as media", async (surface) => {
  const root = await mkdtemp(path.join(tmpdir(), "lbh-assets-invalid-paths-")); directories.push(root);
  for (const directory of ["public", "content", "out"]) await mkdir(path.join(root, directory));
  await writeFile(path.join(root, "manifest.json"), '{"assets":[]}');
  if (surface === "content") {
    await writeFile(path.join(root, "content/data.tsx"), `
      export const data = [{ src: "/images/missing.png" }, { videoUrl: "media/missing.mp4" },
        { poster: "../poster.jpg" }, { action: "download", href: "/files/catalogue" },
        { href: "/en/FAQ" }, { href: "../Contact" }];
      export const scripts = <script src="/_next/static/framework.js" />;
    `);
  } else {
    await writeFile(path.join(root, "out/index.html"), `<img src="/images/missing.png"><video src="media/missing.mp4" poster="../poster.jpg"></video>
      <a download href="/files/catalogue">Catalogue</a><a href="/en/FAQ">FAQ</a><a href="../Contact">Contact</a>
      <script src="/_next/static/framework.js"></script><link rel="stylesheet" href="/_next/static/style.css">`);
  }
  const result = run("--public", path.join(root, "public"), "--content", path.join(root, "content"), "--source-roots", path.join(root, "content"), "--manifest", path.join(root, "manifest.json"), "--output", path.join(root, "out"), "--json");
  expect(result.status).toBe(1);
  expect(JSON.parse(result.stdout).errors).toEqual([
    "non-local media path: ../poster.jpg",
    "non-local media path: /files/catalogue",
    "non-local media path: /images/missing.png",
    "non-local media path: media/missing.mp4",
  ]);
});
