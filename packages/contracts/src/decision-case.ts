import { z } from "zod";

import {
  BriefPrioritySchema,
  HouseholdBriefSchema,
  MoveTimeframeSchema,
  PurchasePurposeSchema,
  ReadinessBlockerSchema,
  ReadinessClassificationSchema,
  TenurePreferenceSchema,
} from "./household-brief";
import { LocalizedTextSchema } from "./property";

export const DecisionCaseReasonSchema = z.enum([
  "property_questions",
  "financing_readiness",
  "viewing_request",
  "accessibility_review",
]);
export const DecisionCaseTopicSchema = z.enum([
  "evidence_unknowns",
  "total_costs",
  "financing_next_steps",
  "property_access",
  "viewing_coordination",
]);
export const AdvisorContactChannelSchema = z.enum(["in_app", "phone", "email"]);
export const DecisionCaseStatusSchema = z.enum(["requested", "assigned", "cancelled", "closed"]);

export const DecisionCaseEventSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["requested", "claimed", "cancelled", "closed"]),
  actorId: z.string().min(2).max(200),
  actorRole: z.enum(["customer", "advisor"]),
  version: z.number().int().positive(),
  reasonCode: z.string().min(2).max(80),
  createdAt: z.string().datetime(),
});

export const DecisionCaseAdvisorContextSchema = z.object({
  snapshotVersion: z.literal("rama.advisor-context.v1"),
  capturedAt: z.string().datetime(),
  purchasePurpose: PurchasePurposeSchema,
  moveTimeframe: MoveTimeframeSchema,
  maxPurchasePriceAed: z.number().int().positive(),
  financingNeeded: z.boolean(),
  minBedrooms: z.number().int().min(0).max(8),
  preferredCommunities: z.array(z.string().trim().min(2).max(80)).max(8),
  tenurePreference: TenurePreferenceSchema,
  priorities: z.array(BriefPrioritySchema).min(1).max(5),
  accessibility: z.object({
    stepFreeAccess: z.boolean(),
    liftAccess: z.boolean(),
    wheelchairBathroom: z.boolean(),
    lowSensoryEnvironment: z.boolean(),
  }),
  readiness: z.object({
    classification: ReadinessClassificationSchema,
    blockers: z.array(ReadinessBlockerSchema),
    assumptionVersion: z.literal("rama.readiness.phase0.v1"),
    disclaimer: LocalizedTextSchema,
  }),
});

export const DecisionCaseSchema = z.object({
  id: z.string().uuid(),
  ownerSubject: z.string().min(2).max(200),
  status: DecisionCaseStatusSchema,
  version: z.number().int().positive(),
  briefId: z.string().uuid(),
  briefVersion: z.number().int().positive(),
  shortlistId: z.string().uuid(),
  shortlistVersion: z.number().int().positive(),
  propertySlugs: z.array(z.string().min(1)).min(1).max(4),
  reason: DecisionCaseReasonSchema,
  topics: z.array(DecisionCaseTopicSchema).min(1).max(5),
  preferredContactChannel: AdvisorContactChannelSchema,
  advisorId: z.string().min(2).max(200).nullable(),
  responseSlaHours: z.literal(4),
  responseDueAt: z.string().datetime(),
  assignedAt: z.string().datetime().nullable(),
  closedAt: z.string().datetime().nullable(),
  retentionUntil: z.string().datetime(),
  dataPolicyVersion: z.literal("rama.customer-handoff.phase1.v1"),
  advisorContext: DecisionCaseAdvisorContextSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  auditTrail: z.array(DecisionCaseEventSchema),
});

export const CreateDecisionCaseCommandSchema = z.object({
  briefId: z.string().uuid(),
  shortlistVersion: z.number().int().positive(),
  propertySlugs: z.array(z.string().min(1)).min(1).max(4).refine((items) => new Set(items).size === items.length, "Case properties must be unique."),
  reason: DecisionCaseReasonSchema,
  topics: z.array(DecisionCaseTopicSchema).min(1).max(5).refine((items) => new Set(items).size === items.length, "Case topics must be unique."),
  preferredContactChannel: AdvisorContactChannelSchema,
});

export const ClaimDecisionCaseCommandSchema = z.object({ expectedVersion: z.number().int().positive() });
export const CancelDecisionCaseCommandSchema = z.object({
  expectedVersion: z.number().int().positive(),
  reason: z.enum(["changed_mind", "resolved_elsewhere", "privacy_preference"]),
});
export const CloseDecisionCaseCommandSchema = z.object({
  expectedVersion: z.number().int().positive(),
  outcome: z.enum(["questions_answered", "viewing_progressed", "not_proceeding"]),
});

export const WithdrawAdvisorConsentCommandSchema = z.object({
  briefId: z.string().uuid(),
  expectedBriefVersion: z.number().int().positive(),
  anonymousAnalyticsAllowed: z.boolean(),
});

export const AdvisorConsentWithdrawalResponseSchema = z.object({
  brief: HouseholdBriefSchema,
  cancelledCaseId: z.string().uuid().nullable(),
  effectiveAt: z.string().datetime(),
});

export const AdvisorDecisionCaseEventSchema = DecisionCaseEventSchema.omit({ actorId: true });
export const AdvisorDecisionCaseSchema = DecisionCaseSchema.omit({
  ownerSubject: true,
  advisorId: true,
  advisorContext: true,
  auditTrail: true,
}).extend({ auditTrail: z.array(AdvisorDecisionCaseEventSchema) });

export const AdvisorCaseContextResponseSchema = z.object({
  caseId: z.string().uuid(),
  caseVersion: z.number().int().positive(),
  briefId: z.string().uuid(),
  briefVersion: z.number().int().positive(),
  context: DecisionCaseAdvisorContextSchema,
  generatedAt: z.string().datetime(),
});

export const DecisionCaseListResponseSchema = z.object({
  items: z.array(DecisionCaseSchema),
  generatedAt: z.string().datetime(),
});

export const AdvisorCaseQueueResponseSchema = z.object({
  items: z.array(AdvisorDecisionCaseSchema),
  metrics: z.object({
    requested: z.number().int().nonnegative(),
    assigned: z.number().int().nonnegative(),
    overdue: z.number().int().nonnegative(),
  }),
  generatedAt: z.string().datetime(),
});

export type DecisionCase = z.infer<typeof DecisionCaseSchema>;
export type DecisionCaseEvent = z.infer<typeof DecisionCaseEventSchema>;
export type DecisionCaseListResponse = z.infer<typeof DecisionCaseListResponseSchema>;
export type AdvisorCaseQueueResponse = z.infer<typeof AdvisorCaseQueueResponseSchema>;
export type AdvisorDecisionCase = z.infer<typeof AdvisorDecisionCaseSchema>;
export type AdvisorCaseContextResponse = z.infer<typeof AdvisorCaseContextResponseSchema>;
export type AdvisorConsentWithdrawalResponse = z.infer<typeof AdvisorConsentWithdrawalResponseSchema>;
export type DecisionCaseAdvisorContext = z.infer<typeof DecisionCaseAdvisorContextSchema>;
export type CreateDecisionCaseCommand = z.infer<typeof CreateDecisionCaseCommandSchema>;
