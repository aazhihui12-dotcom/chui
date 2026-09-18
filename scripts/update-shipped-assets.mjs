import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
const manifest = {};
for (const file of (await Promise.all(["media", "downloads", "fonts"].map(dir => files(`public/${dir}`)))).flat().sort()) {
  manifest[`/${path.relative("public", file)}`] = createHash("sha256").update(await readFile(file)).digest("hex");
}
await writeFile("content/shipped-assets.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Recorded ${Object.keys(manifest).length} shipped asset checksums.`);
