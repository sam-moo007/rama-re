import {
  EvidenceWorkItemSchema,
  residence1204,
  type EvidenceWorkflowStatus,
  type EvidenceWorkItem,
} from "@rama/contracts";
import { randomUUID } from "node:crypto";

import {
  EvidenceRepositoryConflictError,
  type EvidenceOperationsRepository,
} from "./evidence-operations.repository";

const statusForClaim = (key: string): EvidenceWorkflowStatus => {
  if (key === "step_free_route") return "approved";
  if (key === "cooling_arrangement" || key === "afternoon_construction_noise") return "in_review";
  return "published";
};

export class InMemoryEvidenceOperationsRepository implements EvidenceOperationsRepository {
  private readonly items = new Map<string, EvidenceWorkItem>();

  constructor() {
    const now = new Date().toISOString();
    for (const claim of residence1204.claims) {
      const workflowStatus = statusForClaim(claim.key);
      const item = EvidenceWorkItemSchema.parse({
        id: claim.id,
        propertySlug: residence1204.slug,
        propertyName: residence1204.name,
        claim,
        workflowStatus,
        version: 1,
        assignedTo: workflowStatus === "in_review" ? "evidence-queue" : null,
        createdAt: now,
        updatedAt: now,
        reviews: [],
        corrections: [],
        auditTrail: [
          {
            id: randomUUID(),
            action: "seeded",
            actorId: "phase-0-seed",
            reason: "Canonical Phase 0 evidence imported.",
            fromStatus: null,
            toStatus: workflowStatus,
            version: 1,
            createdAt: now,
          },
        ],
      });
      this.items.set(item.id, item);
    }
  }

  async list(): Promise<EvidenceWorkItem[]> {
    return structuredClone([...this.items.values()]);
  }

  async findById(id: string): Promise<EvidenceWorkItem | null> {
    const item = this.items.get(id);
    return item ? structuredClone(item) : null;
  }

  async save(item: EvidenceWorkItem, expectedVersion: number | null): Promise<EvidenceWorkItem> {
    const validated = EvidenceWorkItemSchema.parse(item);
    const current = this.items.get(validated.id);
    const currentVersion = current?.version ?? null;
    if (currentVersion !== expectedVersion) {
      throw new EvidenceRepositoryConflictError(validated.id, expectedVersion, currentVersion);
    }
    if (validated.version !== (expectedVersion ?? 0) + 1) {
      throw new EvidenceRepositoryConflictError(validated.id, expectedVersion, currentVersion);
    }
    this.items.set(validated.id, structuredClone(validated));
    return structuredClone(validated);
  }
}
