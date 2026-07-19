import { getCustomerApiHeaders } from "./customer-api-auth";
import type {
  EntityResolutionQueueResponse,
  EntityResolutionWorkItem,
  PartnerFileImportResult,
} from "@rama/contracts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

export async function uploadPartnerFile(
  file: File,
  sourceKey: string,
  schemaVersion: string
): Promise<PartnerFileImportResult> {
  const headers = await getCustomerApiHeaders();

  // Read file as ArrayBuffer to compute sha256 and base64
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Compute SHA256
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Convert to Base64 (canonical, without line breaks)
  // btoa works on strings of character codes, so we need to map the Uint8Array
  // Note: for very large files, a chunked approach is safer, but MVP files are < 5MB.
  const binaryString = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  const contentBase64 = btoa(binaryString);

  const payload = {
    sourceKey,
    batchIdempotencyKey: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    schemaVersion,
    retrievedAt: new Date().toISOString(),
    artifact: {
      objectKey: file.name,
      sha256,
      mimeType: file.type || "text/csv",
      byteSize: bytes.length,
      capturedAt: new Date().toISOString(),
    },
    contentBase64,
  };

  const res = await fetch(`${API_BASE}/ingestion/partner-file`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload partner file");
  }

  return res.json();
}

export async function getResolutionQueue(): Promise<EntityResolutionQueueResponse> {
  const headers = await getCustomerApiHeaders();
  const res = await fetch(`${API_BASE}/ingestion/resolution-queue`, {
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch resolution queue");
  }

  return res.json();
}

export async function resolveEntity(
  id: string,
  decision: "matched" | "conflict" | "rejected",
  expectedVersion: number,
  canonicalPropertySlug: string | null = null,
  reason: string = "Manual operator decision"
): Promise<EntityResolutionWorkItem> {
  const headers = await getCustomerApiHeaders();
  const res = await fetch(`${API_BASE}/ingestion/resolution-queue/${id}/resolve`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expectedVersion,
      decision,
      canonicalPropertySlug,
      reason,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to resolve entity");
  }

  return res.json();
}

export async function listSources(): Promise<import("@rama/contracts").IngestionSource[]> {
  const headers = await getCustomerApiHeaders();
  const res = await fetch(`${API_BASE}/ingestion/sources`, { headers });
  if (!res.ok) throw new Error("Failed to fetch sources");
  return res.json();
}

export async function listRecords(limit?: number): Promise<import("@rama/contracts").IngestionRecordListResponse> {
  const headers = await getCustomerApiHeaders();
  const url = limit ? `${API_BASE}/ingestion/records?limit=${limit}` : `${API_BASE}/ingestion/records`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch records");
  return res.json();
}
