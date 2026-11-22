import test from "node:test";
import assert from "node:assert/strict";
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
    assert.equal(typeof image.source, "string", `${key} should retain a source reference for local preparation`);
    assert.ok(image.source.length > 0, `${key} should retain a non-empty source reference`);
    assert.match(image.alt, /[\u3400-\u9fff]/, `${key} should have Chinese alt text`);
    assert.ok(image.width > 0 && image.height > 0, `${key} should have positive dimensions`);
    assert.match(image.output, /^[a-z0-9-]+\.webp$/);
  }
});
