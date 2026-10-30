import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDirectory } from "@/runtime/lib/catalog";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(name))
    return new Response(null, { status: 404 });
  try {
    const bytes = await readFile(join(dataDirectory(), "uploads", name));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": "image/webp",
        "cache-control": "public,max-age=31536000,immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
