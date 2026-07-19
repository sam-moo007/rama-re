import { z } from "zod";

import { LocalizedTextSchema } from "./property";

export const PurchasePurposeSchema = z.enum(["primary_home", "investment", "undecided"]);
export const MoveTimeframeSchema = z.enum(["0_3_months", "3_6_months", "6_12_months", "exploring"]);
export const TenurePreferenceSchema = z.enum(["ready", "off_plan", "either"]);
export const BriefPrioritySchema = z.enum([
  "commute",
  "step_free_access",
  "schools",
  "outdoor_space",
  "quiet_home",
  "rental_yield",
  "building_services",
]);

export const HouseholdBriefInputSchema = z
  .object({
    locale: z.enum(["en", "ar"]),
    householdSize: z.number().int().min(1).max(12),
    childrenCount: z.number().int().min(0).max(10),
    purchasePurpose: PurchasePurposeSchema,
    moveTimeframe: MoveTimeframeSchema,
    maxPurchasePriceAed: z.number().int().min(300_000).max(100_000_000),
    availableCashAed: z.number().int().min(0).max(100_000_000),
    financingNeeded: z.boolean(),
    comfortableMonthlyPaymentAed: z.number().int().min(1_000).max(1_000_000).nullable(),
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
    consent: z.object({
      processingAccepted: z.literal(true),
      advisorContactAllowed: z.boolean(),
      anonymousAnalyticsAllowed: z.boolean(),
    }),
  })
  .superRefine((value, context) => {
    if (value.childrenCount >= value.householdSize) {
      context.addIssue({
        code: "custom",
        path: ["childrenCount"],
        message: "Children count must be lower than total household size.",
      });
    }
    if (new Set(value.preferredCommunities.map((item) => item.toLowerCase())).size !== value.preferredCommunities.length) {
      context.addIssue({ code: "custom", path: ["preferredCommunities"], message: "Communities must be unique." });
    }
    if (new Set(value.priorities).size !== value.priorities.length) {
      context.addIssue({ code: "custom", path: ["priorities"], message: "Priorities must be unique." });
    }
    if (value.financingNeeded && value.comfortableMonthlyPaymentAed === null) {
      context.addIssue({
        code: "custom",
        path: ["comfortableMonthlyPaymentAed"],
        message: "A comfortable monthly payment is required when financing is needed.",
      });
    }
    if (!value.financingNeeded && value.comfortableMonthlyPaymentAed !== null) {
      context.addIssue({
        code: "custom",
        path: ["comfortableMonthlyPaymentAed"],
        message: "Monthly payment must be empty for a cash purchase.",
      });
    }
  });

export const ReadinessClassificationSchema = z.enum(["cash_ready", "cash_gap", "finance_review"]);
export const ReadinessBlockerSchema = z.enum(["cash_shortfall", "payment_comfort_review"]);

export const HouseholdReadinessSchema = z.object({
  classification: ReadinessClassificationSchema,
  estimatedMinimumCashAed: z.number().int().nonnegative(),
  estimatedAcquisitionCostsAed: z.number().int().nonnegative(),
  estimatedDownPaymentAed: z.number().int().nonnegative(),
  estimatedIllustrativeMonthlyPaymentAed: z.number().int().nonnegative().nullable(),
  cashGapAed: z.number().int().nonnegative(),
  assumedLoanToValuePercent: z.number().min(0).max(100).nullable(),
  assumedAcquisitionCostPercent: z.number().min(0).max(100),
  blockers: z.array(ReadinessBlockerSchema),
  assumptionVersion: z.literal("rama.readiness.phase0.v1"),
  disclaimer: LocalizedTextSchema,
  calculatedAt: z.string().datetime(),
});

export const HouseholdBriefStatusSchema = z.enum(["draft", "submitted"]);
export const HouseholdBriefEventSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["created", "updated", "submitted", "consent_updated"]),
  actorId: z.string().trim().min(2).max(200),
  reason: z.string().trim().min(4).max(500),
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
});

export const HouseholdBriefSchema = z.object({
  id: z.string().uuid(),
  ownerSubject: z.string().trim().min(2).max(200),
  status: HouseholdBriefStatusSchema,
  version: z.number().int().positive(),
  input: HouseholdBriefInputSchema,
  readiness: HouseholdReadinessSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  submittedAt: z.string().datetime().nullable(),
  auditTrail: z.array(HouseholdBriefEventSchema),
});

export const CreateHouseholdBriefCommandSchema = z.object({ input: HouseholdBriefInputSchema });
export const UpdateHouseholdBriefCommandSchema = z.object({
  expectedVersion: z.number().int().positive(),
  input: HouseholdBriefInputSchema,
});
export const SubmitHouseholdBriefCommandSchema = z.object({ expectedVersion: z.number().int().positive() });
export const AmendHouseholdBriefConsentCommandSchema = z.object({
  expectedVersion: z.number().int().positive(),
  advisorContactAllowed: z.boolean(),
  anonymousAnalyticsAllowed: z.boolean(),
  reason: z.enum(["advisor_handoff", "preference_change"]),
});
export const HouseholdBriefListResponseSchema = z.object({
  items: z.array(HouseholdBriefSchema),
  generatedAt: z.string().datetime(),
});

export type HouseholdBriefInput = z.infer<typeof HouseholdBriefInputSchema>;
export type HouseholdReadiness = z.infer<typeof HouseholdReadinessSchema>;
export type HouseholdBrief = z.infer<typeof HouseholdBriefSchema>;
export type HouseholdBriefEvent = z.infer<typeof HouseholdBriefEventSchema>;
export type HouseholdBriefListResponse = z.infer<typeof HouseholdBriefListResponseSchema>;
