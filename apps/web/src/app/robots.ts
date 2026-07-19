import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get("host") || "rama.ae";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/en/partner/", "/ar/partner/", "/en/owner/", "/ar/owner/", "/en/operations/", "/ar/operations/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
