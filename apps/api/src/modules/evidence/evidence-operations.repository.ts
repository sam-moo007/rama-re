import type { EvidenceWorkItem } from "@rama/contracts";

export const EVIDENCE_OPERATIONS_REPOSITORY = Symbol("EVIDENCE_OPERATIONS_REPOSITORY");

export class EvidenceRepositoryConflictError extends Error {
  constructor(
    readonly itemId: string,
    readonly expectedVersion: number | null,
    readonly currentVersion: number | null,
  ) {
    super(`Evidence work item '${itemId}' changed while it was being saved.`);
    this.name = "EvidenceRepositoryConflictError";
  }
}

export interface EvidenceOperationsRepository {
  list(): Promise<EvidenceWorkItem[]>;
  findById(id: string): Promise<EvidenceWorkItem | null>;
  save(item: EvidenceWorkItem, expectedVersion: number | null): Promise<EvidenceWorkItem>;
}
