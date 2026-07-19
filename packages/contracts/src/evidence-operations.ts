import { z } from "zod";

import { EvidenceClaimSchema, LocalizedTextSchema } from "./property";

export const EvidenceWorkflowStatusSchema = z.enum([
  "draft",
  "in_review",
  "approved",
  "published",
  "expired",
  "superseded",
]);

export const EvidenceReviewDecisionSchema = z.enum([
  "approved",
  "rejected",
  "needs_information",
]);

export const EvidenceReviewSchema = z.object({
  id: z.string().uuid(),
  decision: EvidenceReviewDecisionSchema,
  reason: z.string().trim().min(4).max(1_000),
  reviewerId: z.string().trim().min(2).max(120),
  createdAt: z.string().datetime(),
});

export const EvidenceCorrectionSchema = z.object({
  id: z.string().uuid(),
  submittedBy: z.string().trim().min(2).max(120),
  reason: z.string().trim().min(8).max(2_000),
  status: z.enum(["open", "triaged", "resolved", "rejected"]),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
  resolutionNote: z.string().nullable(),
});

export const EvidenceAuditEventSchema = z.object({
  id: z.string().uuid(),
  action: z.enum([
    "seeded",
    "reviewed",
    "published",
    "expired",
    "correction_requested",
    "superseded",
  ]),
  actorId: z.string().trim().min(2).max(120),
  reason: z.string().nullable(),
  fromStatus: EvidenceWorkflowStatusSchema.nullable(),
  toStatus: EvidenceWorkflowStatusSchema,
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
});

export const EvidenceWorkItemSchema = z.object({
  id: z.string().uuid(),
  propertySlug: z.string().min(1),
  propertyName: LocalizedTextSchema,
  claim: EvidenceClaimSchema,
  workflowStatus: EvidenceWorkflowStatusSchema,
  version: z.number().int().positive(),
  assignedTo: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  reviews: z.array(EvidenceReviewSchema),
  corrections: z.array(EvidenceCorrectionSchema),
  auditTrail: z.array(EvidenceAuditEventSchema),
});

export const EvidenceQueueResponseSchema = z.object({
  items: z.array(EvidenceWorkItemSchema),
  counts: z.record(EvidenceWorkflowStatusSchema, z.number().int().nonnegative()),
  generatedAt: z.string().datetime(),
});

const VersionedCommandSchema = z.object({
  expectedVersion: z.number().int().positive(),
});

export const ReviewEvidenceCommandSchema = VersionedCommandSchema.extend({
  decision: EvidenceReviewDecisionSchema,
  reason: z.string().trim().min(4).max(1_000),
});

export const PublishEvidenceCommandSchema = VersionedCommandSchema.extend({
  reason: z.string().trim().min(4).max(1_000).default("Approved evidence published."),
});

export const ExpireEvidenceCommandSchema = VersionedCommandSchema.extend({
  reason: z.string().trim().min(8).max(1_000),
});

export const RequestCorrectionCommandSchema = VersionedCommandSchema.extend({
  reason: z.string().trim().min(8).max(2_000),
});

export const SupersedeEvidenceCommandSchema = VersionedCommandSchema.extend({
  reason: z.string().trim().min(8).max(1_000),
  replacement: EvidenceClaimSchema.omit({ id: true, supersedes: true }),
});

export type EvidenceWorkflowStatus = z.infer<typeof EvidenceWorkflowStatusSchema>;
export type EvidenceWorkItem = z.infer<typeof EvidenceWorkItemSchema>;
export type EvidenceQueueResponse = z.infer<typeof EvidenceQueueResponseSchema>;
export type ReviewEvidenceCommand = z.infer<typeof ReviewEvidenceCommandSchema>;
export type PublishEvidenceCommand = z.infer<typeof PublishEvidenceCommandSchema>;
export type ExpireEvidenceCommand = z.infer<typeof ExpireEvidenceCommandSchema>;
export type RequestCorrectionCommand = z.infer<typeof RequestCorrectionCommandSchema>;
export type SupersedeEvidenceCommand = z.infer<typeof SupersedeEvidenceCommandSchema>;
