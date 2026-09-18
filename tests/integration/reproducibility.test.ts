// @vitest-environment node
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

it.skipIf(process.env.LBH_REPRO_CHILD === "1")("default tests and asset audit work in a checkout with no raw capture cache", () => {
  const root = mkdtempSync(path.join(tmpdir(), "lbh-fresh-checkout-"));
  try {
    const tracked = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" }).stdout.split("\0").filter(Boolean);
    for (const file of tracked) if (existsSync(file)) { mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); cpSync(file, path.join(root, file)); }
    symlinkSync(path.join(process.cwd(), "node_modules"), path.join(root, "node_modules"), "dir");
    expect(existsSync(path.join(root, "source-cache/pages"))).toBe(false);
    expect(existsSync(path.join(root, "source-cache/assets"))).toBe(false);
    const audit = spawnSync(process.execPath, ["scripts/check-assets.mjs"], { cwd: root, encoding: "utf8" });
    expect(audit.status, audit.stderr.slice(0, 1200)).toBe(0);
    const tests = spawnSync("npm", ["test"], { cwd: root, env: { ...process.env, LBH_REPRO_CHILD: "1" }, encoding: "utf8", timeout: 90_000 });
    expect(tests.status, `${tests.stdout}\n${tests.stderr}`.slice(-5000)).toBe(0);
  } finally { rmSync(root, { recursive: true, force: true }); }
}, 120_000);
