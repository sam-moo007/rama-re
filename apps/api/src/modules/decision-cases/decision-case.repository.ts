import type { DecisionCase } from "@rama/contracts";

export const DECISION_CASE_REPOSITORY = Symbol("DECISION_CASE_REPOSITORY");

export class DecisionCaseConflictError extends Error {
  constructor(readonly caseId: string, readonly expectedVersion: number | null, readonly currentVersion: number | null) {
    super(`Decision case '${caseId}' changed while it was being saved.`);
    this.name = "DecisionCaseConflictError";
  }
}

export interface DecisionCaseRepository {
  find(id: string): Promise<DecisionCase | null>;
  listByOwner(ownerSubject: string): Promise<DecisionCase[]>;
  listAdvisorQueue(advisorId: string): Promise<DecisionCase[]>;
  save(decisionCase: DecisionCase, expectedVersion: number | null): Promise<DecisionCase>;
  purgeExpired(before: string, limit: number): Promise<number>;
}
