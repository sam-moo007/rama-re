import { describe, expect, it } from "vitest";

import { HouseholdBriefInputSchema } from "./household-brief";

const validInput = {
  locale: "en",
  householdSize: 2,
  childrenCount: 0,
  purchasePurpose: "primary_home",
  moveTimeframe: "3_6_months",
  maxPurchasePriceAed: 2_000_000,
  availableCashAed: 600_000,
  financingNeeded: true,
  comfortableMonthlyPaymentAed: 12_000,
  minBedrooms: 2,
  preferredCommunities: ["Dubai Marina", "Downtown Dubai"],
  tenurePreference: "ready",
  priorities: ["commute", "step_free_access"],
  accessibility: {
    stepFreeAccess: true,
    liftAccess: true,
    wheelchairBathroom: false,
    lowSensoryEnvironment: false,
  },
  consent: {
    processingAccepted: true,
    advisorContactAllowed: false,
    anonymousAnalyticsAllowed: false,
  },
} as const;

describe("HouseholdBriefInputSchema", () => {
  it("accepts structured, consented household constraints", () => {
    expect(HouseholdBriefInputSchema.parse(validInput)).toEqual(validInput);
  });

  it("rejects inconsistent household and financing fields", () => {
    expect(
      HouseholdBriefInputSchema.safeParse({
        ...validInput,
        childrenCount: 2,
        comfortableMonthlyPaymentAed: null,
      }).success,
    ).toBe(false);
  });

  it("rejects duplicate priorities and communities", () => {
    expect(
      HouseholdBriefInputSchema.safeParse({
        ...validInput,
        priorities: ["commute", "commute"],
        preferredCommunities: ["Dubai Marina", "dubai marina"],
      }).success,
    ).toBe(false);
  });
});
