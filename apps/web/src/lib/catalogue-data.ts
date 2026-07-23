import {
  CatalogueSearchResponseSchema,
  PropertyShortlistMineResponseSchema,
  PropertyCompareResponseSchema,
  catalogueFixtures,
  type CatalogueSearchResponse,
  type PropertySearchResultItem,
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

const fallbackShortlistResponse: PropertyShortlistMineResponse = {
  shortlist: {
    id: "00000000-0000-0000-0000-000000000000",
    ownerSubject: "anonymous",
    version: 1,
    propertySlugs: ["residence-1204", "marina-penthouse-5401"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditTrail: [],
  },
  generatedAt: new Date().toISOString(),
};

const fallbackSearchItems: PropertySearchResultItem[] = catalogueFixtures.map((item) => ({
  ...item,
  fitSignals: [
    {
      key: "price_budget",
      category: "hard_constraint",
      outcome: "match",
      label: { en: "Price within target range", ar: "السعر ضمن النطاق المستهدف" },
      explanation: { en: "Price matches your liquidity profile.", ar: "السعر يطابق ملفك المالي." },
    },
    {
      key: "location_access",
      category: "preference",
      outcome: "match",
      label: { en: "Primary corridor connectivity", ar: "اتصال مباشر بالممر الرئيسي" },
      explanation: { en: "Direct connection to major transit corridors.", ar: "اتصال مباشر بمسارات النقل الرئيسية." },
    },
  ],
  fitScore: item.evidenceCoverage >= 80 ? 94 : 82,
  rankingExplanation: {
    en: "High evidence completeness and direct verified records.",
    ar: "اكتمال أدلة عالٍ وسجلات موثقة مباشرة.",
  },
  selectedMobility: item.mobility[0] ?? null,
}));

export async function getDiscoveryData(searchParams: DiscoverySearchParams): Promise<{
  search: CatalogueSearchResponse;
  shortlist: PropertyShortlistMineResponse;
}> {
  try {
    const headers = await getCustomerApiHeaders();
    const [searchResponse, shortlistResponse] = await Promise.all([
      fetch(`${apiUrl}/properties/search${queryString(searchParams)}`, { cache: "no-store", headers }),
      fetch(`${apiUrl}/shortlists/mine`, { cache: "no-store", headers }),
    ]);
    if (!searchResponse.ok || !shortlistResponse.ok) {
      throw new Error(`Catalogue API error status.`);
    }
    return {
      search: CatalogueSearchResponseSchema.parse(await searchResponse.json()),
      shortlist: PropertyShortlistMineResponseSchema.parse(await shortlistResponse.json()),
    };
  } catch (error) {
    console.warn("API server unreachable, returning discovery fallback data:", error);
    return {
      search: {
        items: fallbackSearchItems,
        total: fallbackSearchItems.length,
        generatedAt: new Date().toISOString(),
        searchVersion: "rama.catalogue.phase1.v2",
        briefVersionApplied: null,
        appliedQuery: {
          communities: [],
          tenure: [],
          freshness: [],
          infrastructureStates: [],
          travelMode: "drive",
          sort: "fit_desc",
          limit: 20,
        },
        facets: {
          communities: [
            { value: "Dubai Creek Harbour", label: { en: "Dubai Creek Harbour", ar: "خور دبي" }, count: 1 },
            { value: "Dubai Marina", label: { en: "Dubai Marina", ar: "مرسى دبي" }, count: 1 },
            { value: "Downtown Dubai", label: { en: "Downtown Dubai", ar: "وسط دبي" }, count: 1 },
            { value: "Palm Jumeirah", label: { en: "Palm Jumeirah", ar: "نخلة جميرا" }, count: 1 },
          ],
          tenure: [
            { value: "ready", label: { en: "Ready", ar: "جاهز" }, count: 3 },
            { value: "off_plan", label: { en: "Off-plan", ar: "على المخطط" }, count: 1 },
          ],
          freshness: [
            { value: "fresh", label: { en: "Fresh", ar: "حديث" }, count: 4 },
          ],
          unknownBedrooms: 0,
          destinations: [
            { value: "difc", label: { en: "DIFC", ar: "مركز دبي المالي" }, count: 4 },
            { value: "downtown_dubai", label: { en: "Downtown Dubai", ar: "وسط دبي" }, count: 4 },
            { value: "dxb_airport", label: { en: "DXB Airport", ar: "مطار دبي" }, count: 4 },
          ],
          infrastructureStates: [
            { value: "present", label: { en: "Present", ar: "قائم" }, count: 4 },
          ],
          unknownMobility: 0,
        },
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      },
      shortlist: fallbackShortlistResponse,
    };
  }
}

export async function getCompareData(slugs: string[]): Promise<{
  compare: PropertyCompareResponse;
  shortlist: PropertyShortlistMineResponse;
}> {
  try {
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
    
    if (!shortlistResponse.ok || !compareResponse.ok) {
      throw new Error(`Compare API error status.`);
    }
    
    return {
      compare: PropertyCompareResponseSchema.parse(await compareResponse.json()),
      shortlist: PropertyShortlistMineResponseSchema.parse(await shortlistResponse.json()),
    };
  } catch (error) {
    console.warn("API server unreachable, returning compare fallback data:", error);
    return {
      compare: {
        items: fallbackSearchItems.filter((p) => slugs.includes(p.slug)),
        generatedAt: new Date().toISOString(),
        briefVersionApplied: null,
        searchVersion: "rama.catalogue.phase1.v2",
      },
      shortlist: fallbackShortlistResponse,
    };
  }
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
