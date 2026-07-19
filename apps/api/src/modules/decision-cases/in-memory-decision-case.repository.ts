import { DecisionCaseSchema, type DecisionCase } from "@rama/contracts";

import { DecisionCaseConflictError, type DecisionCaseRepository } from "./decision-case.repository";

export class InMemoryDecisionCaseRepository implements DecisionCaseRepository {
  private readonly cases = new Map<string, DecisionCase>();

  async find(id: string): Promise<DecisionCase | null> {
    const item = this.cases.get(id);
    return item ? structuredClone(item) : null;
  }

  async listByOwner(ownerSubject: string): Promise<DecisionCase[]> {
    return structuredClone([...this.cases.values()].filter((item) => item.ownerSubject === ownerSubject).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }

  async listAdvisorQueue(advisorId: string): Promise<DecisionCase[]> {
    return structuredClone([...this.cases.values()]
      .filter((item) => item.status === "requested" || (item.status === "assigned" && item.advisorId === advisorId))
      .sort((a, b) => a.responseDueAt.localeCompare(b.responseDueAt)));
  }

  async save(decisionCase: DecisionCase, expectedVersion: number | null): Promise<DecisionCase> {
    const parsed = DecisionCaseSchema.parse(decisionCase);
    const current = this.cases.get(parsed.id);
    const currentVersion = current?.version ?? null;
    if (currentVersion !== expectedVersion || parsed.version !== (expectedVersion ?? 0) + 1) {
      throw new DecisionCaseConflictError(parsed.id, expectedVersion, currentVersion);
    }
    const appended = parsed.auditTrail.filter((event) => expectedVersion === null || event.version > expectedVersion);
    if (appended.length !== 1 || appended[0]?.version !== parsed.version) {
      throw new Error("Each decision-case save must append exactly one audit event.");
    }
    this.cases.set(parsed.id, structuredClone(parsed));
    return structuredClone(parsed);
  }

  async purgeExpired(before: string, limit: number): Promise<number> {
    const expired = [...this.cases.values()]
      .filter((item) => item.retentionUntil <= before)
      .sort((a, b) => a.retentionUntil.localeCompare(b.retentionUntil))
      .slice(0, limit);
    for (const item of expired) this.cases.delete(item.id);
    return expired.length;
  }
}
