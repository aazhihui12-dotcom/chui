import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/metadata";
import { sitePath } from "@/lib/site-path";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteOrigin()}${sitePath('/sitemap.xml')}` };
}
