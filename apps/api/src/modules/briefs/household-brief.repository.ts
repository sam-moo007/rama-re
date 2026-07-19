import type { HouseholdBrief } from "@rama/contracts";

export const HOUSEHOLD_BRIEF_REPOSITORY = Symbol("HOUSEHOLD_BRIEF_REPOSITORY");

export class HouseholdBriefConflictError extends Error {
  constructor(
    readonly briefId: string,
    readonly expectedVersion: number | null,
    readonly currentVersion: number | null,
  ) {
    super(`Household brief '${briefId}' changed while it was being saved.`);
    this.name = "HouseholdBriefConflictError";
  }
}

export interface HouseholdBriefRepository {
  listByOwner(ownerSubject: string): Promise<HouseholdBrief[]>;
  find(id: string): Promise<HouseholdBrief | null>;
  save(brief: HouseholdBrief, expectedVersion: number | null): Promise<HouseholdBrief>;
}
