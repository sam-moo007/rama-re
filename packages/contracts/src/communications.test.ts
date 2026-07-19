import { describe, expect, it } from "vitest";

import { ContactProfileSchema, CustomerNotificationSchema, ReplaceContactPointsCommandSchema, SendAdvisorMessageCommandSchema, UpdateNotificationPreferencesCommandSchema } from "./communications";

describe("communications contracts", () => {
  it("normalizes email and requires at least one valid contact point", () => {
    expect(ReplaceContactPointsCommandSchema.parse({ expectedVersion: null, locale: "en", email: "  USER@Example.COM ", phoneE164: null }).email).toBe("user@example.com");
    expect(() => ReplaceContactPointsCommandSchema.parse({ expectedVersion: null, locale: "en", email: null, phoneE164: null })).toThrow();
    expect(() => ReplaceContactPointsCommandSchema.parse({ expectedVersion: null, locale: "en", email: null, phoneE164: "0501234567" })).toThrow();
  });

  it("requires in-app case updates while keeping external channels optional", () => {
    expect(() => UpdateNotificationPreferencesCommandSchema.parse({ expectedVersion: 1, preferences: { caseUpdatesInApp: false, caseUpdatesEmail: true, caseUpdatesSms: false, allowInAppFallback: true } })).toThrow();
  });

  it("limits advisor messages to structured templates", () => {
    expect(SendAdvisorMessageCommandSchema.parse({ expectedCaseVersion: 2, template: "viewing_coordination" })).toMatchObject({ template: "viewing_coordination" });
    expect(() => SendAdvisorMessageCommandSchema.parse({ expectedCaseVersion: 2, template: "free form customer text" })).toThrow();
    expect(() => ContactProfileSchema.parse({ id: crypto.randomUUID() })).toThrow();
  });

  it("represents durable queued delivery without exposing internal outbox data",()=>{
    const notification=CustomerNotificationSchema.parse({id:crypto.randomUUID(),caseId:crypto.randomUUID(),version:1,template:"advisor_acknowledgement",requestedChannel:"email",deliveredChannel:null,status:"queued",deliveryReason:"delivery_queued",createdAt:new Date().toISOString(),readAt:null,retentionUntil:new Date(Date.now()+60_000).toISOString(),ownerSubject:"must-be-stripped",attemptCount:0});
    expect(notification).toMatchObject({status:"queued",deliveredChannel:null});expect(notification).not.toHaveProperty("ownerSubject");expect(notification).not.toHaveProperty("attemptCount");
  });
});
