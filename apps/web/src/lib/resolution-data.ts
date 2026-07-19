import {
  EntityResolutionQueueResponseSchema,
  type EntityResolutionQueueResponse,
} from "@rama/contracts";
import { getOperationsApiHeaders } from "./operations-api-auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";

export async function getEntityResolutionQueue(): Promise<EntityResolutionQueueResponse> {
  const response = await fetch(`${apiUrl}/ingestion/resolution-queue`, {
    cache: "no-store",
    headers: await getOperationsApiHeaders(),
  });
  if (!response.ok) throw new Error(`Entity-resolution API returned ${response.status}.`);
  return EntityResolutionQueueResponseSchema.parse(await response.json());
}
