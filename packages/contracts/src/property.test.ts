import { describe, expect, it } from "vitest";

import { residence1204 } from "./fixtures/residence-1204";
import { PropertyDecisionRoomSchema } from "./property";

describe("PropertyDecisionRoom contract", () => {
  it("accepts the canonical Residence 1204 fixture", () => {
    expect(PropertyDecisionRoomSchema.parse(residence1204)).toEqual(residence1204);
  });

  it("keeps unknown critical evidence visible", () => {
    const unknowns = residence1204.claims.filter((claim) => claim.status === "unknown");

    expect(unknowns).toHaveLength(1);
    expect(unknowns[0]?.nextVerificationStep).not.toBeNull();
  });

  it("does not treat coverage as a quality score", () => {
    expect(residence1204.evidenceCoverage).toBe(82);
    expect(residence1204).not.toHaveProperty("qualityScore");
  });
});
