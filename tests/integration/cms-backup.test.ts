// @vitest-environment node
import { afterEach, expect, it } from "vitest";
import {
  mkdtemp,
  readFile,
  mkdir,
  writeFile,
  utimes,
  stat,
  rm,
  symlink,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CmsStore } from "@/lib/cms/store";
import { apowerProducts } from "@/content/apower";
import { backupCms } from "../../scripts/cms-backup.mjs";
const exec = promisify(execFile);
let directory: string;
afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});
it('executes backups when the release is launched through the current symlink',async()=>{
 directory=await mkdtemp(join(tmpdir(),'apower-backup-cli-'));
 const data=join(directory,'data'),backups=join(directory,'backups');
 const store=new CmsStore(join(data,'cms.sqlite'));store.seed(apowerProducts,[]);
 const link=join(directory,'current');await symlink(resolve('.'),link,'dir');
 await exec(process.execPath,[join(link,'scripts/cms-backup.mjs'),data,backups]);
 expect((await readdir(backups)).filter(name=>name.endsWith('.tar.gz'))).toHaveLength(1);
 store.db.close();
});
it("creates a consistent restorable database and upload archive, pruning only expired owned backups", async () => {
  directory = await mkdtemp(join(tmpdir(), "apower-backup-test-"));
  const data = join(directory, "data"),
    backups = join(directory, "backups");
  const store = new CmsStore(join(data, "cms.sqlite"));
  store.seed(apowerProducts, []);
  store.createUser("admin", "InitialPassword123!", "admin");
  const deleted = store.get("product", "AP-G3")!;
  store.remove("product", deleted.id, deleted.version, "admin");
  await mkdir(join(data, "uploads"));
  const filename = "a22b3ce1-aabb-4abc-8abc-123456789abc.webp";
  await writeFile(join(data, "uploads", filename), "fixture-image-bytes");
  const archive = await backupCms(data, backups);
  expect(archive).toMatch(/\.tar\.gz$/);
  expect((await stat(archive)).mode & 0o777).toBe(0o600);
  const restored = join(directory, "restored");
  await mkdir(restored);
  await exec("tar", ["-xzf", archive, "-C", restored]);
  const loaded = new CmsStore(join(restored, "cms.sqlite"));
  expect(loaded.get("product", "AP-G3")!.deletedAt).not.toBeNull();
  expect(loaded.users()[0].username).toBe("admin");
  expect(await readFile(join(restored, "uploads", filename), "utf8")).toBe(
    "fixture-image-bytes",
  );
  loaded.db.close();
  const old = new Date(Date.now() - 8 * 86400000);
  await utimes(archive, old, old);
  await writeFile(join(backups, "do-not-delete.txt"), "keep");
  await utimes(join(backups, "do-not-delete.txt"), old, old);
  await backupCms(data, backups);
  await expect(stat(archive)).rejects.toMatchObject({ code: "ENOENT" });
  expect(await readFile(join(backups, "do-not-delete.txt"), "utf8")).toBe(
    "keep",
  );
  store.db.close();
});
