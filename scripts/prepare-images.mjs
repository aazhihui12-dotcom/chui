import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { siteImages } from "../src/data/image-manifest.mjs";
import {
  encodeImagePayload,
  resolvePythonExecutable,
  validateManifest
} from "../src/lib/image-pipeline.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "public", "images", "site");
const pythonScript = path.join(projectRoot, "scripts", "resize_image.py");
const python = resolvePythonExecutable();

validateManifest(siteImages);

if (process.argv.includes("--check")) {
  console.log(`Validated ${Object.keys(siteImages).length} source images.`);
  process.exit(0);
}

for (const [key, image] of Object.entries(siteImages)) {
  const output = path.join(outputRoot, image.output);
  const payload = encodeImagePayload({ ...image, output });
  const result = spawnSync(python, [pythonScript, payload], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0) {
    throw new Error(`Failed to prepare ${key}: ${result.stderr || result.stdout}`);
  }
  console.log(`Prepared ${image.output}`);
}
