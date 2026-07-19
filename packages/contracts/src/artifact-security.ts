import { z } from "zod";

import { IngestionArtifactSchema, IngestionSourceSchema } from "./ingestion";

export const MalwareVerdictSchema = z.enum(["clean", "malicious"]);

export const ArtifactScanSchema = z.object({
  engine: z.string().trim().min(2).max(120),
  verdict: MalwareVerdictSchema,
  signature: z.string().trim().min(1).max(500).nullable(),
  scannedAt: z.string().datetime(),
});

export const SecuredArtifactSchema = z.object({
  id: z.string().uuid(),
  sourceKey: IngestionSourceSchema.shape.key,
  batchIdempotencyKey: z.string().trim().min(8).max(60),
  storageDriver: z.enum(["memory", "s3"]),
  bucket: z.string().trim().min(3).max(255),
  artifact: IngestionArtifactSchema,
  scan: ArtifactScanSchema,
  immutable: z.literal(true),
  submittedBy: z.string().trim().min(2).max(120),
  storedAt: z.string().datetime(),
  replayed: z.boolean(),
});

export const SecuredArtifactListResponseSchema = z.object({
  items: z.array(SecuredArtifactSchema),
  generatedAt: z.string().datetime(),
});

export type MalwareVerdict = z.infer<typeof MalwareVerdictSchema>;
export type ArtifactScan = z.infer<typeof ArtifactScanSchema>;
export type SecuredArtifact = z.infer<typeof SecuredArtifactSchema>;
export type SecuredArtifactListResponse = z.infer<typeof SecuredArtifactListResponseSchema>;
