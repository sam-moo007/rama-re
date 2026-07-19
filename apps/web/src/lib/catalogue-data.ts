import {
  CatalogueSearchResponseSchema,
  PropertyShortlistMineResponseSchema,
  PropertyCompareResponseSchema,
  type CatalogueSearchResponse,
  type PropertyShortlistMineResponse,
  type PropertyCompareResponse,
  type PropertyDecisionRoom,
} from "@rama/contracts";

import { getCustomerApiHeaders } from "./customer-api-auth";

const apiUrl =
  process.env.RAMA_API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000/api/v1";

export type DiscoverySearchParams = Record<string, string | string[] | undefined>;

const queryString = (input: DiscoverySearchParams): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined && value !== "") params.set(key, value);
  }
  const value = params.toString();
  return value ? `?${value}` : "";
};

export async function getDiscoveryData(searchParams: DiscoverySearchParams): Promise<{
  search: CatalogueSearchResponse;
  shortlist: PropertyShortlistMineResponse;
}> {
  const headers = await getCustomerApiHeaders();
  const [searchResponse, shortlistResponse] = await Promise.all([
    fetch(`${apiUrl}/properties/search${queryString(searchParams)}`, { cache: "no-store", headers }),
    fetch(`${apiUrl}/shortlists/mine`, { cache: "no-store", headers }),
  ]);
  if (!searchResponse.ok) throw new Error(`Catalogue API returned ${searchResponse.status}.`);
  if (!shortlistResponse.ok) throw new Error(`Shortlist API returned ${shortlistResponse.status}.`);
  return {
    search: CatalogueSearchResponseSchema.parse(await searchResponse.json()),
    shortlist: PropertyShortlistMineResponseSchema.parse(await shortlistResponse.json()),
  };
}

export async function getCompareData(slugs: string[]): Promise<{
  compare: PropertyCompareResponse;
  shortlist: PropertyShortlistMineResponse;
}> {
  const headers = await getCustomerApiHeaders();
  
  const [compareResponse, shortlistResponse] = await Promise.all([
    fetch(`${apiUrl}/properties/compare`, {
      method: "POST",
      cache: "no-store",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    }),
    fetch(`${apiUrl}/shortlists/mine`, { cache: "no-store", headers }),
  ]);
  
  if (!shortlistResponse.ok) throw new Error(`Shortlist API returned ${shortlistResponse.status}.`);
  if (!compareResponse.ok) {
    if (compareResponse.status === 404) {
      throw new Error("One or more properties could not be found for comparison.");
    }
    throw new Error(`Compare API returned ${compareResponse.status}.`);
  }
  
  return {
    compare: PropertyCompareResponseSchema.parse(await compareResponse.json()),
    shortlist: PropertyShortlistMineResponseSchema.parse(await shortlistResponse.json()),
  };
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDecisionRoom> {
  const headers = await getCustomerApiHeaders();
  const res = await fetch(`${apiUrl}/properties/${slug}`, {
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("PROPERTY_NOT_FOUND");
    }
    throw new Error(`Failed to fetch property ${slug}: ${res.statusText}`);
  }

  return (await res.json()) as PropertyDecisionRoom;
}
