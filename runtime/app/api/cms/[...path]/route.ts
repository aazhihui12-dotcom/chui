import { join } from "node:path";
import { getCmsStore, dataDirectory } from "@/runtime/lib/catalog";
import { handleCmsRequest } from "@/lib/cms/api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(request: Request) {
  const origin =
    process.env.APOWER_PUBLIC_ORIGIN ??
    (process.env.NODE_ENV === "production" ? "" : new URL(request.url).origin);
  if (!origin)
    return Response.json(
      { error: "后台安全地址尚未配置" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  try {
    return await handleCmsRequest(request, getCmsStore(), {
      origin,
      uploadDir: join(dataDirectory(), "uploads"),
      secure: origin.startsWith("https://"),
    });
  } catch (e) {
    console.error("CMS unavailable", e instanceof Error ? e.name : "Unknown");
    return Response.json(
      { error: "后台初始化失败，请联系管理员" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
export const GET = handle,
  POST = handle,
  PATCH = handle,
  DELETE = handle;
