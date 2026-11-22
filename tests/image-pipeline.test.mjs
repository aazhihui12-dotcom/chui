import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { siteImages } from "../src/data/image-manifest.mjs";
import {
  validateManifest,
  expectedOutputPaths,
  resolvePythonExecutable,
  encodeImagePayload
} from "../src/lib/image-pipeline.mjs";

test("image validation names the exact missing source file", () => {
  const missing = "C:/definitely-missing/angjiuxi-image.jpg";
  assert.throws(
    () => validateManifest({ broken: { ...siteImages.heroDesktopPrimary, source: missing } }),
    new RegExp(missing.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );
});

test("image pipeline selects a Python runtime with Pillow", () => {
  const python = resolvePythonExecutable();
  const result = spawnSync(python, ["-c", "from PIL import Image"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("image payload preserves Chinese and Windows paths across process boundaries", () => {
  const payload = { source: "C:/素材/01.jpg", output: "E:\\知识库\\hero.webp" };
  const decoded = JSON.parse(Buffer.from(encodeImagePayload(payload), "base64").toString("utf8"));
  assert.deepEqual(decoded, payload);
});

test("prepared image set contains every optimized website asset", () => {
  const outputRoot = path.resolve("public/images/site");
  const outputs = expectedOutputPaths(siteImages, outputRoot);
  assert.equal(outputs.length, 17);
  for (const output of outputs) {
    assert.ok(fs.existsSync(output), `missing optimized image: ${output}`);
    assert.ok(fs.statSync(output).size > 10_000, `optimized image is unexpectedly small: ${output}`);
  }
});
