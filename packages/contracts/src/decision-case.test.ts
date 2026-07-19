import { describe, expect, it } from "vitest";

import { AdvisorDecisionCaseEventSchema, CreateDecisionCaseCommandSchema, DecisionCaseSchema, WithdrawAdvisorConsentCommandSchema } from "./decision-case";

describe("decision case contracts", () => {
  it("rejects duplicate property and topic selections", () => {
    const base = {
      briefId: "1b89658b-a2c4-4e4a-a357-5c56d12c2e66",
      shortlistVersion: 1,
      reason: "property_questions",
      preferredContactChannel: "in_app",
    } as const;
    expect(() => CreateDecisionCaseCommandSchema.parse({ ...base, propertySlugs: ["one", "one"], topics: ["total_costs"] })).toThrow();
    expect(() => CreateDecisionCaseCommandSchema.parse({ ...base, propertySlugs: ["one"], topics: ["total_costs", "total_costs"] })).toThrow();
  });

  it("requires bounded retention and policy metadata", () => {
    const now = "2026-07-18T12:00:00.000Z";
    expect(() => DecisionCaseSchema.parse({ id: crypto.randomUUID(), createdAt: now })).toThrow();
  });

  it("removes actor identifiers from advisor audit events", () => {
    const event = AdvisorDecisionCaseEventSchema.parse({ id: crypto.randomUUID(), action: "requested", actorId: "customer-private-subject", actorRole: "customer", version: 1, reasonCode: "property_questions", createdAt: "2026-07-18T12:00:00.000Z" });
    expect(event).not.toHaveProperty("actorId");
  });

  it("requires optimistic brief ownership data for consent withdrawal", () => {
    expect(() => WithdrawAdvisorConsentCommandSchema.parse({ briefId: crypto.randomUUID(), expectedBriefVersion: 0, anonymousAnalyticsAllowed: false })).toThrow();
    expect(WithdrawAdvisorConsentCommandSchema.parse({ briefId: crypto.randomUUID(), expectedBriefVersion: 3, anonymousAnalyticsAllowed: false })).toMatchObject({ expectedBriefVersion: 3 });
  });
});
