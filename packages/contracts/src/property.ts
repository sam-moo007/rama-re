import { z } from "zod";

export const LocalizedTextSchema = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
});

export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

export const EvidenceClassSchema = z.enum([
  "registry_regulator",
  "document_verified",
  "on_site_observed",
  "provider_attested",
  "modelled",
  "unverified_unknown",
]);

export const ClaimStatusSchema = z.enum(["verified", "review", "stale", "unknown"]);

export const EvidenceClaimSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  label: LocalizedTextSchema,
  displayValue: LocalizedTextSchema,
  evidenceClass: EvidenceClassSchema,
  status: ClaimStatusSchema,
  source: LocalizedTextSchema,
  method: LocalizedTextSchema,
  observedAt: z.string().datetime().nullable(),
  retrievedAt: z.string().datetime(),
  validTo: z.string().datetime().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  artifactReference: z.string().nullable(),
  supersedes: z.string().nullable(),
  isCritical: z.boolean(),
  nextVerificationStep: LocalizedTextSchema.nullable(),
});

export const PropertyFactSchema = z.object({
  label: LocalizedTextSchema,
  value: LocalizedTextSchema,
  basis: z.enum(["measured", "source_provided", "modelled", "unknown"]),
});

export const CostLineSchema = z.object({
  id: z.string(),
  timing: z.enum(["reservation", "transaction", "ownership", "exit"]),
  label: LocalizedTextSchema,
  amountAed: z.number().nonnegative().nullable(),
  amountRangeAed: z.tuple([z.number().nonnegative(), z.number().nonnegative()]).nullable(),
  editable: z.boolean(),
  source: LocalizedTextSchema,
  effectiveAt: z.string().date(),
});

export const TourHotspotSchema = z.object({
  id: z.string(),
  yaw: z.number().min(0).max(360),
  pitch: z.number().min(-90).max(90),
  label: LocalizedTextSchema,
  type: z.enum(["evidence", "detail", "question"]),
});

export const TourRoomSchema = z.object({
  id: z.string(),
  label: LocalizedTextSchema,
  hotspotCount: z.number().int().nonnegative(),
  evidenceCount: z.number().int().nonnegative(),
  hotspots: z.array(TourHotspotSchema).optional(),
});

export const DecisionRiskSchema = z.object({
  id: z.string(),
  issue: LocalizedTextSchema,
  impact: LocalizedTextSchema,
  source: LocalizedTextSchema,
  nextStep: LocalizedTextSchema,
  status: z.enum(["review", "unknown"]),
});

export const DldTransactionSchema = z.object({
  id: z.string(),
  date: z.string().date(),
  priceAed: z.number().positive(),
  areaSqft: z.number().positive(),
  pricePerSqft: z.number().positive(),
  bedrooms: z.number().int().nonnegative(),
  propertyType: LocalizedTextSchema,
});

export const PropertyDecisionRoomSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: LocalizedTextSchema,
  community: LocalizedTextSchema,
  priceAed: z.number().positive(),
  evidenceCoverage: z.number().min(0).max(100),
  media: z.object({
    representation: z.enum(["exact_unit", "same_type", "representative", "artist_impression"]),
    capturedAt: z.string().datetime(),
    transcriptAvailable: z.boolean(),
  }),
  fitReasons: z.array(LocalizedTextSchema).min(1),
  uncertainConstraint: LocalizedTextSchema,
  facts: z.array(PropertyFactSchema),
  claims: z.array(EvidenceClaimSchema),
  tour: z.object({
    rooms: z.array(TourRoomSchema),
    tier: z.enum(["essential", "panorama", "spatial", "xr"]),
    transcriptAvailable: z.boolean(),
    keyboardAccessible: z.boolean(),
    gltfUrl: z.string().url().optional(),
    xrCapabilities: z.array(z.enum(["ar", "vr", "dollhouse"])).optional(),
    meshMetadata: z.record(z.string(), z.unknown()).optional(),
  }),
  costs: z.array(CostLineSchema),
  risks: z.array(DecisionRiskSchema),
  dldTransactions: z.array(DldTransactionSchema),
  advisor: z.object({
    responseSlaHours: z.number().positive(),
    openQuestions: z.array(LocalizedTextSchema),
    shortlistCount: z.number().int().nonnegative(),
  }),
  publishedAt: z.string().datetime(),
});

export type PropertyDecisionRoom = z.infer<typeof PropertyDecisionRoomSchema>;
export type EvidenceClaim = z.infer<typeof EvidenceClaimSchema>;
export type CostLine = z.infer<typeof CostLineSchema>;
export type DldTransaction = z.infer<typeof DldTransactionSchema>;
export type DecisionRisk = z.infer<typeof DecisionRiskSchema>;
export type TourHotspot = z.infer<typeof TourHotspotSchema>;
