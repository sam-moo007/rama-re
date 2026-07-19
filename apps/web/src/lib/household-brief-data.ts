import {
  HouseholdBriefListResponseSchema,
  type HouseholdBriefListResponse,
} from "@rama/contracts";

import { getCustomerApiHeaders } from "./customer-api-auth";

const apiUrl =
  process.env.RAMA_API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000/api/v1";

export async function getMyHouseholdBriefs(): Promise<HouseholdBriefListResponse> {
  const response = await fetch(`${apiUrl}/briefs/mine`, {
    cache: "no-store",
    headers: await getCustomerApiHeaders(),
  });
  if (!response.ok) throw new Error(`Household brief API returned ${response.status}.`);
  return HouseholdBriefListResponseSchema.parse(await response.json());
}
