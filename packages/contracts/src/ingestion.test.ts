import { describe, expect, it } from "vitest";

import {
  CreateIngestionSourceCommandSchema,
  ManualIngestionCommandSchema,
  PartnerFileImportCommandSchema,
  ResolveEntityCommandSchema,
} from "./ingestion";

describe("ingestion contracts", () => {
  const artifact = {
    objectKey: "manual/2026/permit-1204.pdf",
    sha256: "a".repeat(64),
    mimeType: "application/pdf",
    byteSize: 24_000,
    capturedAt: null,
  };

  it("requires source entitlement and an explicit evidence-class allowlist", () => {
    expect(
      CreateIngestionSourceCommandSchema.parse({
        key: "rama.manual.phase-0",
        displayName: { en: "RAMA manual intake", ar: "الإدخال اليدوي لراما" },
        adapterKind: "manual",
        entitlementReference: "ENT-PHASE-0-001",
        allowedEvidenceClasses: ["document_verified"],
        reason: "Approved for controlled Phase 0 intake.",
      }),
    ).toBeTruthy();
  });

  it("rejects ingestion without a content checksum", () => {
    const result = ManualIngestionCommandSchema.safeParse({
      sourceKey: "rama.manual.phase-0",
      idempotencyKey: "permit-1204-v1",
      schemaVersion: "claim.v1",
      propertySlug: "residence-1204",
      claimKey: "advert_permit_broker",
      evidenceClass: "document_verified",
      retrievedAt: "2026-07-18T05:00:00.000Z",
      artifact: { ...artifact, sha256: "not-a-checksum" },
      payload: { permit: "12345" },
    });

    expect(result.success).toBe(false);
  });

  it("accepts a bounded, replayable manual envelope", () => {
    expect(
      ManualIngestionCommandSchema.parse({
        sourceKey: "rama.manual.phase-0",
        idempotencyKey: "permit-1204-v1",
        schemaVersion: "claim.v1",
        propertySlug: "residence-1204",
        claimKey: "advert_permit_broker",
        evidenceClass: "document_verified",
        retrievedAt: "2026-07-18T05:00:00.000Z",
        artifact,
        payload: { permit: "12345", broker: "RAMA-TEST" },
      }),
    ).toBeTruthy();
  });

  it("requires a matched entity to name its canonical property", () => {
    expect(
      ResolveEntityCommandSchema.safeParse({
        expectedVersion: 1,
        decision: "matched",
        canonicalPropertySlug: null,
        reason: "Identity matched without a canonical target.",
      }).success,
    ).toBe(false);
  });

  it("accepts a bounded partner-file envelope", () => {
    expect(
      PartnerFileImportCommandSchema.parse({
        sourceKey: "partner.approved",
        batchIdempotencyKey: "batch-20260718-v1",
        schemaVersion: "rama.partner.csv.v1",
        retrievedAt: "2026-07-18T05:00:00.000Z",
        artifact: { ...artifact, objectKey: "partner/batch.csv", mimeType: "text/csv" },
        contentBase64: "aGVhZGVyCnJvdw==",
      }),
    ).toBeTruthy();
  });
});
