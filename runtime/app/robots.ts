import { siteOrigin } from "@/lib/metadata";
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
