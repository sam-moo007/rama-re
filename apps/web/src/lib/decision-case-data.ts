import {
  AdvisorCaseQueueResponseSchema,
  CatalogueSearchResponseSchema,
  DecisionCaseListResponseSchema,
  HouseholdBriefListResponseSchema,
  PropertyShortlistMineResponseSchema,
  type AdvisorCaseQueueResponse,
  type CatalogueSearchResponse,
  type DecisionCaseListResponse,
  type HouseholdBriefListResponse,
  type PropertyShortlistMineResponse,
} from "@rama/contracts";

import { getAdvisorApiHeaders } from "./advisor-api-auth";
import { getCustomerApiHeaders } from "./customer-api-auth";

const apiUrl = process.env.RAMA_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";

const checked = async <T>(path: string, headers: Record<string, string>, parse: (value: unknown) => T): Promise<T> => {
  const response = await fetch(`${apiUrl}/${path}`, { cache: "no-store", headers });
  if (!response.ok) throw new Error(`${path} returned ${response.status}.`);
  return parse(await response.json());
};

export async function getCustomerHandoffData(): Promise<{
  briefs: HouseholdBriefListResponse;
  shortlist: PropertyShortlistMineResponse;
  cases: DecisionCaseListResponse;
  catalogue: CatalogueSearchResponse;
}> {
  const headers = await getCustomerApiHeaders();
  const [briefs, shortlist, cases, catalogue] = await Promise.all([
    checked("briefs/mine", headers, (value) => HouseholdBriefListResponseSchema.parse(value)),
    checked("shortlists/mine", headers, (value) => PropertyShortlistMineResponseSchema.parse(value)),
    checked("decision-cases/mine", headers, (value) => DecisionCaseListResponseSchema.parse(value)),
    checked("properties/search?limit=50", headers, (value) => CatalogueSearchResponseSchema.parse(value)),
  ]);
  return { briefs, shortlist, cases, catalogue };
}

export async function getAdvisorQueueData(): Promise<AdvisorCaseQueueResponse> {
  return checked("advisor/cases/queue", await getAdvisorApiHeaders(), (value) => AdvisorCaseQueueResponseSchema.parse(value));
}

