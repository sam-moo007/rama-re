import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { catalogueFixtures } from "@rama/contracts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get("host") || "rama.ae";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const staticRoutes = ["", "/discover", "/cost-engine", "/readiness"].flatMap((route) => [
    {
      url: `${baseUrl}/en${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    },
    {
      url: `${baseUrl}/ar${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    },
  ]);

  const propertyRoutes = catalogueFixtures.flatMap((property) => [
    {
      url: `${baseUrl}/en/properties/${property.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ar/properties/${property.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ]);

  return [...staticRoutes, ...propertyRoutes];
}
