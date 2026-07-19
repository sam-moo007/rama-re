import { HouseholdBriefSchema, type HouseholdBrief } from "@rama/contracts";

import {
  HouseholdBriefConflictError,
  type HouseholdBriefRepository,
} from "./household-brief.repository";

export class InMemoryHouseholdBriefRepository implements HouseholdBriefRepository {
  private readonly briefs = new Map<string, HouseholdBrief>();

  async listByOwner(ownerSubject: string): Promise<HouseholdBrief[]> {
    return structuredClone(
      [...this.briefs.values()]
        .filter((brief) => brief.ownerSubject === ownerSubject)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    );
  }

  async find(id: string): Promise<HouseholdBrief | null> {
    const brief = this.briefs.get(id);
    return brief ? structuredClone(brief) : null;
  }

  async save(brief: HouseholdBrief, expectedVersion: number | null): Promise<HouseholdBrief> {
    const validated = HouseholdBriefSchema.parse(brief);
    const current = this.briefs.get(validated.id);
    const currentVersion = current?.version ?? null;
    if (currentVersion !== expectedVersion || validated.version !== (expectedVersion ?? 0) + 1) {
      throw new HouseholdBriefConflictError(validated.id, expectedVersion, currentVersion);
    }
    const events = validated.auditTrail.filter(
      (event) => expectedVersion === null || event.version > expectedVersion,
    );
    if (events.length !== 1 || events[0]?.version !== validated.version) {
      throw new Error("Each household brief save must append exactly one audit event.");
    }
    this.briefs.set(validated.id, structuredClone(validated));
    return structuredClone(validated);
  }
}
