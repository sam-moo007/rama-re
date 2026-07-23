import { z } from "zod";

import { LocalizedTextSchema } from "./property";

export const CatalogueRecordKindSchema = z.enum(["curated", "synthetic_demo"]);
export const PropertyTenureSchema = z.enum(["ready", "off_plan"]);
export const PropertyFreshnessSchema = z.enum(["fresh", "review", "stale"]);
export const PropertyEvidenceStateSchema = z.enum(["verified", "review", "unknown"]);
export const PropertySearchSortSchema = z.enum(["fit_desc", "evidence_desc", "price_asc", "price_desc", "newest"]);
export const MobilityDestinationSchema = z.enum(["difc", "downtown_dubai", "dxb_airport"]);
export const TravelModeSchema = z.enum(["drive", "public_transport", "walk"]);
export const InfrastructureStateSchema = z.enum(["present", "committed", "modelled"]);

export const PropertyGeoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  precision: z.enum(["building", "project", "community"]),
  evidenceState: PropertyEvidenceStateSchema,
  sourceLabel: LocalizedTextSchema,
  observedAt: z.string().datetime(),
  retrievedAt: z.string().datetime(),
});

export const PropertyMobilityEstimateSchema = z.object({
  destination: MobilityDestinationSchema,
  mode: TravelModeSchema,
  infrastructureState: InfrastructureStateSchema,
  durationMinutes: z.number().int().positive().max(300).nullable(),
  distanceKm: z.number().positive().max(300).nullable(),
  methodLabel: LocalizedTextSchema,
  methodVersion: z.string().min(3).max(80),
  sourceLabel: LocalizedTextSchema,
  observedAt: z.string().datetime(),
  retrievedAt: z.string().datetime(),
  assumptions: z.array(LocalizedTextSchema).max(6),
});

export const PropertyCatalogueRecordSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  recordKind: CatalogueRecordKindSchema,
  name: LocalizedTextSchema,
  community: LocalizedTextSchema,
  priceAed: z.number().int().positive(),
  bedrooms: z.number().int().min(0).max(12).nullable(),
  bathrooms: z.number().min(0).max(12).nullable(),
  internalAreaSqFt: z.number().int().positive().nullable(),
  tenure: PropertyTenureSchema,
  evidenceCoverage: z.number().int().min(0).max(100),
  freshness: PropertyFreshnessSchema,
  publishedAt: z.string().datetime(),
  mediaRepresentation: z.enum(["exact_unit", "same_type", "representative", "artist_impression"]),
  stepFreeAccess: PropertyEvidenceStateSchema,
  decisionRoomAvailable: z.boolean(),
  sponsored: z.boolean(),
  missingCriticalEvidence: z.array(LocalizedTextSchema),
  geo: PropertyGeoPointSchema.nullable(),
  mobility: z.array(PropertyMobilityEstimateSchema).max(24),
});

export const PropertyFitSignalSchema = z.object({
  key: z.string().min(1).max(80),
  category: z.enum(["hard_constraint", "preference", "unavailable_evidence", "assumption"]),
  outcome: z.enum(["match", "review", "unknown"]),
  label: LocalizedTextSchema,
  explanation: LocalizedTextSchema,
});

export const PropertySearchResultItemSchema = PropertyCatalogueRecordSchema.extend({
  fitSignals: z.array(PropertyFitSignalSchema).min(1),
  fitScore: z.number().int().min(0).max(100),
  rankingExplanation: LocalizedTextSchema,
  selectedMobility: PropertyMobilityEstimateSchema.nullable(),
});

export const CatalogueSearchQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    communities: z.array(z.string().trim().min(2).max(80)).max(8).default([]),
    minPriceAed: z.number().int().min(0).optional(),
    maxPriceAed: z.number().int().positive().optional(),
    minBedrooms: z.number().int().min(0).max(12).optional(),
    tenure: z.array(PropertyTenureSchema).max(2).default([]),
    minEvidenceCoverage: z.number().int().min(0).max(100).optional(),
    freshness: z.array(PropertyFreshnessSchema).max(3).default([]),
    destination: MobilityDestinationSchema.optional(),
    travelMode: TravelModeSchema.default("drive"),
    maxTravelMinutes: z.number().int().positive().max(180).optional(),
    infrastructureStates: z.array(InfrastructureStateSchema).max(3).default([]),
    northLatitude: z.number().min(-90).max(90).optional(),
    southLatitude: z.number().min(-90).max(90).optional(),
    eastLongitude: z.number().min(-180).max(180).optional(),
    westLongitude: z.number().min(-180).max(180).optional(),
    sort: PropertySearchSortSchema.default("fit_desc"),
    limit: z.number().int().min(1).max(50).default(20),
    cursor: z.string().trim().min(16).max(1024).optional(),
  })
  .superRefine((value, context) => {
    if (value.minPriceAed !== undefined && value.maxPriceAed !== undefined && value.minPriceAed > value.maxPriceAed) {
      context.addIssue({ code: "custom", path: ["maxPriceAed"], message: "Maximum price must not be lower than minimum price." });
    }
    if (value.maxTravelMinutes !== undefined && value.destination === undefined) {
      context.addIssue({ code: "custom", path: ["destination"], message: "A destination is required when maximum travel time is set." });
    }
    const bounds=[value.northLatitude,value.southLatitude,value.eastLongitude,value.westLongitude];
    if (bounds.some((item)=>item!==undefined) && bounds.some((item)=>item===undefined)) context.addIssue({code:"custom",path:["northLatitude"],message:"All four map bounds are required."});
    if (value.northLatitude!==undefined&&value.southLatitude!==undefined&&value.northLatitude<=value.southLatitude) context.addIssue({code:"custom",path:["northLatitude"],message:"North latitude must be greater than south latitude."});
    if (value.eastLongitude!==undefined&&value.westLongitude!==undefined&&value.eastLongitude<=value.westLongitude) context.addIssue({code:"custom",path:["eastLongitude"],message:"East longitude must be greater than west longitude."});
  });

export const PropertySearchFacetSchema = z.object({
  value: z.string().min(1),
  label: LocalizedTextSchema,
  count: z.number().int().nonnegative(),
});

export const CatalogueSearchResponseSchema = z.object({
  items: z.array(PropertySearchResultItemSchema),
  total: z.number().int().nonnegative(),
  generatedAt: z.string().datetime(),
  searchVersion: z.literal("rama.catalogue.phase1.v2"),
  briefVersionApplied: z.number().int().positive().nullable(),
  appliedQuery: CatalogueSearchQuerySchema,
  facets: z.object({
    communities: z.array(PropertySearchFacetSchema),
    tenure: z.array(PropertySearchFacetSchema),
    freshness: z.array(PropertySearchFacetSchema),
    unknownBedrooms: z.number().int().nonnegative(),
    destinations: z.array(PropertySearchFacetSchema),
    infrastructureStates: z.array(PropertySearchFacetSchema),
    unknownMobility: z.number().int().nonnegative(),
  }),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
});

export const ShortlistAuditEventSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["created", "updated"]),
  actorId: z.string().min(2).max(200),
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
});

export const PropertyShortlistSchema = z.object({
  id: z.string().uuid(),
  ownerSubject: z.string().min(2).max(200),
  version: z.number().int().positive(),
  propertySlugs: z.array(z.string().min(1)).max(20),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  auditTrail: z.array(ShortlistAuditEventSchema),
});

export const UpdatePropertyShortlistCommandSchema = z.object({
  expectedVersion: z.number().int().positive().nullable(),
  propertySlugs: z.array(z.string().min(1)).max(20).refine((items) => new Set(items).size === items.length, "Shortlist properties must be unique."),
});

export const PropertyShortlistMineResponseSchema = z.object({
  shortlist: PropertyShortlistSchema.nullable(),
  generatedAt: z.string().datetime(),
});

export const PropertyCompareRequestSchema = z.object({
  slugs: z.array(z.string().min(1)).min(2).max(3).refine((items) => new Set(items).size === items.length, "Compare properties must be unique."),
});

export const PropertyCompareResponseSchema = z.object({
  items: z.array(PropertySearchResultItemSchema).min(2).max(3),
  generatedAt: z.string().datetime(),
  briefVersionApplied: z.number().int().positive().nullable(),
  searchVersion: z.literal("rama.catalogue.phase1.v2"),
});

export const CatalogueIndexReconciliationResultSchema=z.object({generation:z.string().uuid(),indexed:z.number().int().nonnegative(),removed:z.number().int().nonnegative(),documentCount:z.number().int().nonnegative(),completedAt:z.string().datetime()});
export const CatalogueIndexReadTelemetrySchema=z.object({source:z.enum(["repository","index"]),candidateCount:z.number().int().nonnegative(),hydratedCount:z.number().int().nonnegative(),missingCanonical:z.number().int().nonnegative(),fingerprintMismatches:z.number().int().nonnegative(),duplicateCandidates:z.number().int().nonnegative(),pages:z.number().int().nonnegative(),durationMs:z.number().int().nonnegative(),completedAt:z.string().datetime()});
export const CatalogueIndexStatusResponseSchema=z.object({durable:z.boolean(),documentCount:z.number().int().nonnegative(),readSource:z.enum(["repository","index"]),lastCandidateRead:CatalogueIndexReadTelemetrySchema.nullable(),lastReconciliation:CatalogueIndexReconciliationResultSchema.nullable(),generatedAt:z.string().datetime()});

export type PropertyCatalogueRecord = z.infer<typeof PropertyCatalogueRecordSchema>;
export type PropertyFitSignal = z.infer<typeof PropertyFitSignalSchema>;
export type PropertySearchResultItem = z.infer<typeof PropertySearchResultItemSchema>;
export type CatalogueSearchQuery = z.infer<typeof CatalogueSearchQuerySchema>;
export type CatalogueSearchResponse = z.infer<typeof CatalogueSearchResponseSchema>;
export type PropertyShortlist = z.infer<typeof PropertyShortlistSchema>;
export type UpdatePropertyShortlistCommand = z.infer<typeof UpdatePropertyShortlistCommandSchema>;
export type PropertyShortlistMineResponse = z.infer<typeof PropertyShortlistMineResponseSchema>;
export type PropertyCompareResponse = z.infer<typeof PropertyCompareResponseSchema>;
export type MobilityDestination = z.infer<typeof MobilityDestinationSchema>;
export type TravelMode = z.infer<typeof TravelModeSchema>;
export type InfrastructureState = z.infer<typeof InfrastructureStateSchema>;
export type PropertyMobilityEstimate = z.infer<typeof PropertyMobilityEstimateSchema>;
export type CatalogueIndexReconciliationResult=z.infer<typeof CatalogueIndexReconciliationResultSchema>;
export type CatalogueIndexReadTelemetry=z.infer<typeof CatalogueIndexReadTelemetrySchema>;
export type CatalogueIndexStatusResponse=z.infer<typeof CatalogueIndexStatusResponseSchema>;
