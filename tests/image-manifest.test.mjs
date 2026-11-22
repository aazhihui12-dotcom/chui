import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { siteImages } from "../src/data/image-manifest.mjs";

const requiredKeys = [
  "heroDesktopPrimary",
  "heroDesktopAlternate",
  "heroMobilePrimary",
  "heroMobileAlternate",
  "showroomPrimary",
  "showroomAlternate",
  "selectionService",
  "livePreparation",
  "materialStillLife",
  "collectionLookOne",
  "collectionLookTwo",
  "collectionLookThree",
  "colorStory",
  "patternDesign",
  "cuttingProduction",
  "denimQualityControl",
  "packingDelivery"
];

test("image manifest catches a missing website story image", () => {
  assert.deepEqual(Object.keys(siteImages), requiredKeys);
  for (const [key, image] of Object.entries(siteImages)) {
    assert.ok(fs.existsSync(image.source), `${key} source should exist: ${image.source}`);
    assert.match(image.alt, /[\u3400-\u9fff]/, `${key} should have Chinese alt text`);
    assert.ok(image.width > 0 && image.height > 0, `${key} should have positive dimensions`);
    assert.match(image.output, /^[a-z0-9-]+\.webp$/);
  }
});
