import {
  EvidenceQueueResponseSchema,
  type EvidenceQueueResponse,
} from "@rama/contracts";
import { getOperationsApiHeaders } from "./operations-api-auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";

export async function getEvidenceQueue(): Promise<EvidenceQueueResponse> {
  const response = await fetch(`${apiUrl}/evidence/queue`, {
    cache: "no-store",
    headers: await getOperationsApiHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Evidence API returned ${response.status}.`);
  }
  return EvidenceQueueResponseSchema.parse(await response.json());
}
