import {
  randomBytes,
  scrypt,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { CmsError } from "./content";

const derive = promisify(scrypt);
export function checkPassword(password: unknown): asserts password is string {
  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  )
    throw new CmsError("密码须为 12–128 个字符");
}
export function hashPassword(password: unknown) {
  checkPassword(password);
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export async function verifyPassword(password: string, encoded: string) {
  if (password.length > 128) return false;
  const [salt, hex] = encoded.split(":");
  const expected = Buffer.from(hex, "hex");
  const actual = (await derive(password, salt, 64)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export const tokenHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
