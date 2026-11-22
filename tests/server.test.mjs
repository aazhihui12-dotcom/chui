import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { resolveRequestPath } from "../scripts/serve.mjs";

test("resolveRequestPath serves clean routes and static assets", () => {
  const root = path.resolve("out");
  assert.equal(resolveRequestPath("/", root), path.join(root, "index.html"));
  assert.equal(resolveRequestPath("/collections/", root), path.join(root, "collections", "index.html"));
  assert.equal(resolveRequestPath("/styles.css", root), path.join(root, "styles.css"));
});

test("resolveRequestPath rejects traversal", () => {
  const root = path.resolve("out");
  assert.equal(resolveRequestPath("/..%2Fpackage.json", root), null);
});
