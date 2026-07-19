import { PropertyShortlistSchema, type PropertyShortlist } from "@rama/contracts";

import { ShortlistConflictError, type ShortlistRepository } from "./shortlist.repository";

export class InMemoryShortlistRepository implements ShortlistRepository {
  private readonly byOwner = new Map<string, PropertyShortlist>();

  async findByOwner(ownerSubject: string): Promise<PropertyShortlist | null> {
    const shortlist = this.byOwner.get(ownerSubject);
    return shortlist ? structuredClone(shortlist) : null;
  }

  async save(shortlist: PropertyShortlist, expectedVersion: number | null): Promise<PropertyShortlist> {
    const parsed = PropertyShortlistSchema.parse(shortlist);
    const current = this.byOwner.get(parsed.ownerSubject);
    const currentVersion = current?.version ?? null;
    if (currentVersion !== expectedVersion || parsed.version !== (expectedVersion ?? 0) + 1) {
      throw new ShortlistConflictError(expectedVersion, currentVersion);
    }
    const appended = parsed.auditTrail.filter((event) => expectedVersion === null || event.version > expectedVersion);
    if (appended.length !== 1 || appended[0]?.version !== parsed.version) {
      throw new Error("Each shortlist save must append exactly one audit event.");
    }
    this.byOwner.set(parsed.ownerSubject, structuredClone(parsed));
    return structuredClone(parsed);
  }
}

