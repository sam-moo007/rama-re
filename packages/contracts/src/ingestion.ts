import { z } from "zod";

import { EvidenceClassSchema, LocalizedTextSchema } from "./property";

export const SourceAdapterKindSchema = z.enum(["manual", "partner_file"]);
export const RawIngestionStatusSchema = z.enum(["accepted", "quarantined"]);

export const IngestionArtifactSchema = z.object({
  objectKey: z.string().trim().min(3).max(1_024),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i, "Artifact sha256 must contain 64 hexadecimal characters."),
  mimeType: z.string().trim().min(3).max(160),
  byteSize: z.number().int().positive().max(5_000_000_000),
  capturedAt: z.string().datetime().nullable(),
});

export const IngestionSourceEventSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["created", "disabled", "enabled"]),
  actorId: z.string().trim().min(2).max(120),
  reason: z.string().trim().min(4).max(1_000),
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
});

export const IngestionSourceSchema = z.object({
  id: z.string().uuid(),
  key: z.string().trim().regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/).min(3).max(120),
  displayName: LocalizedTextSchema,
  adapterKind: SourceAdapterKindSchema,
  entitlementReference: z.string().trim().min(4).max(500),
  allowedEvidenceClasses: z.array(EvidenceClassSchema).min(1),
  active: z.boolean(),
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  disabledAt: z.string().datetime().nullable(),
  disabledBy: z.string().nullable(),
  disabledReason: z.string().nullable(),
  auditTrail: z.array(IngestionSourceEventSchema),
});

export const CreateIngestionSourceCommandSchema = z.object({
  key: IngestionSourceSchema.shape.key,
  displayName: LocalizedTextSchema,
  adapterKind: SourceAdapterKindSchema,
  entitlementReference: z.string().trim().min(4).max(500),
  allowedEvidenceClasses: z.array(EvidenceClassSchema).min(1),
  reason: z.string().trim().min(4).max(1_000),
});

export const SetIngestionSourceStateCommandSchema = z.object({
  expectedVersion: z.number().int().positive(),
  reason: z.string().trim().min(4).max(1_000),
});

export const ManualIngestionCommandSchema = z.object({
  sourceKey: IngestionSourceSchema.shape.key,
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,119}$/),
  schemaVersion: z.string().trim().regex(/^[a-z0-9][a-z0-9._-]{1,49}$/i),
  propertySlug: z.string().trim().min(2).max(180),
  claimKey: z.string().trim().min(2).max(180),
  evidenceClass: EvidenceClassSchema,
  retrievedAt: z.string().datetime(),
  artifact: IngestionArtifactSchema,
  payload: z.record(z.string(), z.unknown()),
});

export const RawIngestionRecordSchema = z.object({
  id: z.string().uuid(),
  sourceKey: IngestionSourceSchema.shape.key,
  adapterKind: SourceAdapterKindSchema,
  idempotencyKey: ManualIngestionCommandSchema.shape.idempotencyKey,
  schemaVersion: ManualIngestionCommandSchema.shape.schemaVersion,
  propertySlug: ManualIngestionCommandSchema.shape.propertySlug,
  claimKey: ManualIngestionCommandSchema.shape.claimKey,
  evidenceClass: EvidenceClassSchema,
  retrievedAt: z.string().datetime(),
  receivedAt: z.string().datetime(),
  submittedBy: z.string().trim().min(2).max(120),
  externalEntityId: z.string().trim().min(1).max(120).nullable(),
  partnerBatchId: z.string().uuid().nullable(),
  payload: z.record(z.string(), z.unknown()),
  payloadSha256: z.string().regex(/^[a-f0-9]{64}$/),
  artifact: IngestionArtifactSchema,
  status: RawIngestionStatusSchema,
});

export const ManualIngestionResultSchema = z.object({
  record: RawIngestionRecordSchema,
  replayed: z.boolean(),
});

export const IngestionRecordListResponseSchema = z.object({
  items: z.array(RawIngestionRecordSchema),
  generatedAt: z.string().datetime(),
});

export const PartnerFileImportCommandSchema = z.object({
  sourceKey: IngestionSourceSchema.shape.key,
  batchIdempotencyKey: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,59}$/),
  schemaVersion: ManualIngestionCommandSchema.shape.schemaVersion,
  retrievedAt: z.string().datetime(),
  artifact: IngestionArtifactSchema,
  contentBase64: z.string().min(4).max(8_000_000),
});

export const PartnerFileRowSchema = z.object({
  externalId: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,49}$/),
  propertySlug: ManualIngestionCommandSchema.shape.propertySlug,
  claimKey: ManualIngestionCommandSchema.shape.claimKey,
  evidenceClass: EvidenceClassSchema,
  retrievedAt: z.string().datetime(),
  payload: z.record(z.string(), z.unknown()),
});

export const PartnerIngestionBatchSchema = z.object({
  id: z.string().uuid(),
  sourceKey: IngestionSourceSchema.shape.key,
  batchIdempotencyKey: PartnerFileImportCommandSchema.shape.batchIdempotencyKey,
  schemaVersion: PartnerFileImportCommandSchema.shape.schemaVersion,
  retrievedAt: z.string().datetime(),
  receivedAt: z.string().datetime(),
  submittedBy: z.string().trim().min(2).max(120),
  artifact: IngestionArtifactSchema,
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  rowCount: z.number().int().positive().max(1_000),
});

export const EntityResolutionStatusSchema = z.enum(["pending", "matched", "conflict", "rejected"]);

export const EntityResolutionEventSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["queued", "matched", "conflict_marked", "rejected"]),
  actorId: z.string().trim().min(2).max(120),
  reason: z.string().trim().min(4).max(1_000),
  fromStatus: EntityResolutionStatusSchema.nullable(),
  toStatus: EntityResolutionStatusSchema,
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
});

export const EntityResolutionWorkItemSchema = z.object({
  id: z.string().uuid(),
  rawRecordId: z.string().uuid(),
  sourceKey: IngestionSourceSchema.shape.key,
  externalEntityId: z.string().trim().min(1).max(120),
  submittedPropertySlug: ManualIngestionCommandSchema.shape.propertySlug,
  status: EntityResolutionStatusSchema,
  canonicalPropertySlug: z.string().trim().min(2).max(180).nullable(),
  version: z.number().int().positive(),
  assignedTo: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  rawRecord: RawIngestionRecordSchema,
  auditTrail: z.array(EntityResolutionEventSchema),
});

export const ResolveEntityCommandSchema = z
  .object({
    expectedVersion: z.number().int().positive(),
    decision: z.enum(["matched", "conflict", "rejected"]),
    canonicalPropertySlug: z.string().trim().min(2).max(180).nullable(),
    reason: z.string().trim().min(4).max(1_000),
  })
  .superRefine((value, context) => {
    if (value.decision === "matched" && !value.canonicalPropertySlug) {
      context.addIssue({
        code: "custom",
        path: ["canonicalPropertySlug"],
        message: "A matched entity requires a canonical property slug.",
      });
    }
    if (value.decision !== "matched" && value.canonicalPropertySlug) {
      context.addIssue({
        code: "custom",
        path: ["canonicalPropertySlug"],
        message: "Only matched entities may specify a canonical property slug.",
      });
    }
  });

export const EntityResolutionQueueResponseSchema = z.object({
  items: z.array(EntityResolutionWorkItemSchema),
  counts: z.record(EntityResolutionStatusSchema, z.number().int().nonnegative()),
  generatedAt: z.string().datetime(),
});

export const PartnerFileImportResultSchema = z.object({
  batch: PartnerIngestionBatchSchema,
  replayedBatch: z.boolean(),
  records: z.array(ManualIngestionResultSchema),
  resolutionItems: z.array(EntityResolutionWorkItemSchema),
  counts: z.object({
    accepted: z.number().int().nonnegative(),
    quarantined: z.number().int().nonnegative(),
    replayed: z.number().int().nonnegative(),
  }),
});

export type IngestionSource = z.infer<typeof IngestionSourceSchema>;
export type IngestionArtifact = z.infer<typeof IngestionArtifactSchema>;
export type IngestionSourceEvent = z.infer<typeof IngestionSourceEventSchema>;
export type CreateIngestionSourceCommand = z.infer<typeof CreateIngestionSourceCommandSchema>;
export type SetIngestionSourceStateCommand = z.infer<typeof SetIngestionSourceStateCommandSchema>;
export type ManualIngestionCommand = z.infer<typeof ManualIngestionCommandSchema>;
export type RawIngestionRecord = z.infer<typeof RawIngestionRecordSchema>;
export type ManualIngestionResult = z.infer<typeof ManualIngestionResultSchema>;
export type IngestionRecordListResponse = z.infer<typeof IngestionRecordListResponseSchema>;
export type PartnerFileImportCommand = z.infer<typeof PartnerFileImportCommandSchema>;
export type PartnerFileRow = z.infer<typeof PartnerFileRowSchema>;
export type PartnerIngestionBatch = z.infer<typeof PartnerIngestionBatchSchema>;
export type EntityResolutionStatus = z.infer<typeof EntityResolutionStatusSchema>;
export type EntityResolutionWorkItem = z.infer<typeof EntityResolutionWorkItemSchema>;
export type ResolveEntityCommand = z.infer<typeof ResolveEntityCommandSchema>;
export type EntityResolutionQueueResponse = z.infer<typeof EntityResolutionQueueResponseSchema>;
export type PartnerFileImportResult = z.infer<typeof PartnerFileImportResultSchema>;
