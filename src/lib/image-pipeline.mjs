import fs from "node:fs";
import path from "node:path";

export function validateManifest(manifest) {
  for (const [key, image] of Object.entries(manifest)) {
    if (!fs.existsSync(image.source)) {
      throw new Error(`Missing source image for ${key}: ${image.source}`);
    }
  }
}

export function expectedOutputPaths(manifest, outputRoot) {
  return Object.values(manifest).map((image) => path.join(outputRoot, image.output));
}

export function resolvePythonExecutable() {
  const bundled = "C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
  if (fs.existsSync(bundled)) return bundled;
  return "python";
}

export function encodeImagePayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}
