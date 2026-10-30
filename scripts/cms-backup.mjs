import { DatabaseSync, backup } from "node:sqlite";
import { realpathSync } from "node:fs";
import {
  mkdir,
  mkdtemp,
  readdir,
  lstat,
  copyFile,
  chmod,
  rename,
  rm,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
const exec = promisify(execFile);
const ownedArchive =
  /^apower-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-f0-9-]{36}\.tar\.gz$/;
export async function backupCms(dataDir, backupDir) {
  const data = resolve(dataDir),
    directory = resolve(backupDir);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const staging = await mkdtemp(join(directory, ".apower-"));
  const archive = join(
    directory,
    `apower-${new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-")}-${randomUUID()}.tar.gz`,
  );
  const pending = archive + ".tmp";
  try {
    const db = new DatabaseSync(join(data, "cms.sqlite"), { readOnly: true });
    try {
      await backup(db, join(staging, "cms.sqlite"));
    } finally {
      db.close();
    }
    const uploads = join(staging, "uploads");
    await mkdir(uploads, { mode: 0o750 });
    const entries = await readdir(join(data, "uploads")).catch((e) => {
      if (e.code === "ENOENT") return [];
      throw e;
    });
    for (const name of entries) {
      if (!/^[a-f0-9-]{36}\.webp$/.test(name)) continue;
      const source = join(data, "uploads", name);
      if ((await lstat(source)).isFile())
        await copyFile(source, join(uploads, name));
    }
    await exec("tar", ["-czf", pending, "-C", staging, "."]);
    await chmod(pending, 0o600);
    await rename(pending, archive);
    for (const name of await readdir(directory)) {
      if (!ownedArchive.test(name)) continue;
      const path = join(directory, name),
        info = await lstat(path);
      if (info.isFile() && info.mtimeMs < Date.now() - 7 * 86400000)
        await rm(path);
    }
    return archive;
  } catch (e) {
    await rm(pending, { force: true });
    throw e;
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [dataDir, backupDir] = process.argv.slice(2);
  if (!dataDir || !backupDir) {
    console.error("Usage: node scripts/cms-backup.mjs DATA_DIR BACKUP_DIR");
    process.exitCode = 1;
  } else {
    try {
      console.log(await backupCms(dataDir, backupDir));
    } catch (e) {
      console.error("Backup failed:", e.message);
      process.exitCode = 1;
    }
  }
}
