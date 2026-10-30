import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { CmsError } from "./content";

export async function limitedBody(
  request: Request,
  limit: number,
): Promise<Buffer> {
  if (Number(request.headers.get("content-length")) > limit)
    throw new CmsError("文件或请求内容过大", 413);
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new CmsError("文件或请求内容过大", 413);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function uploadImage(
  request: Request,
  directory: string,
  authorize: () => unknown,
) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(
      request.headers.get("content-type")?.split(";")[0] ?? "",
    )
  )
    throw new CmsError("仅支持 JPG、PNG、WebP 图片");
  const bytes = await limitedBody(request, 8 * 1024 * 1024);
  try {
    const decoder = sharp(bytes, {
        limitInputPixels: 24_000_000,
        failOn: "warning",
      }),
      metadata = await decoder.metadata();
    if (
      !["jpeg", "png", "webp"].includes(metadata.format ?? "") ||
      !metadata.width ||
      !metadata.height ||
      (metadata.pages ?? 1) > 1
    )
      throw new Error("Unsupported image");
    const { data, info } = await decoder
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer({ resolveWithObject: true });
    authorize();
    mkdirSync(directory, { recursive: true, mode: 0o750 });
    const name = `${randomUUID()}.webp`;
    writeFileSync(join(directory, name), data, { flag: "wx", mode: 0o640 });
    return {
      src: `/uploads/${name}`,
      width: info.width,
      height: info.height,
      alt: "",
    };
  } catch (e) {
    if (e instanceof CmsError) throw e;
    throw new CmsError(
      "图片无法解码，请上传有效且不超过 2400 万像素的 JPG、PNG 或 WebP",
    );
  }
}
