import { lstat, symlink } from "node:fs/promises";
import { resolve } from "node:path";
const path = resolve("runtime/public");
try {
  const info = await lstat(path);
  if (!info.isSymbolicLink())
    throw new Error(
      "runtime/public exists and is not the expected generated symlink",
    );
} catch (e) {
  if (e.code !== "ENOENT") throw e;
  await symlink("../public", path, "dir");
}
console.log("Runtime public assets ready.");
