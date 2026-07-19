import type { PropertyShortlist } from "@rama/contracts";

export const SHORTLIST_REPOSITORY = Symbol("SHORTLIST_REPOSITORY");

export class ShortlistConflictError extends Error {
  constructor(readonly expectedVersion: number | null, readonly currentVersion: number | null) {
    super("The shortlist changed while it was being saved.");
    this.name = "ShortlistConflictError";
  }
}

export interface ShortlistRepository {
  findByOwner(ownerSubject: string): Promise<PropertyShortlist | null>;
  save(shortlist: PropertyShortlist, expectedVersion: number | null): Promise<PropertyShortlist>;
}

