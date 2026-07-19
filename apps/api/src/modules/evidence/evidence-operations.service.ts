import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  EvidenceQueueResponseSchema,
  EvidenceWorkItemSchema,
  ExpireEvidenceCommandSchema,
  PublishEvidenceCommandSchema,
  RequestCorrectionCommandSchema,
  ReviewEvidenceCommandSchema,
  SupersedeEvidenceCommandSchema,
  type EvidenceQueueResponse,
  type EvidenceWorkflowStatus,
  type EvidenceWorkItem,
  type ExpireEvidenceCommand,
  type PublishEvidenceCommand,
  type RequestCorrectionCommand,
  type ReviewEvidenceCommand,
  type SupersedeEvidenceCommand,
} from "@rama/contracts";
import { randomUUID } from "node:crypto";
import type { ZodType } from "zod";

import type { RamaActor } from "../../common/auth/rama-actor";
import {
  EVIDENCE_OPERATIONS_REPOSITORY,
  EvidenceRepositoryConflictError,
  type EvidenceOperationsRepository,
} from "./evidence-operations.repository";

const workflowStatuses: EvidenceWorkflowStatus[] = [
  "draft",
  "in_review",
  "approved",
  "published",
  "expired",
  "superseded",
];

@Injectable()
export class EvidenceOperationsService {
  constructor(
    @Inject(EVIDENCE_OPERATIONS_REPOSITORY)
    private readonly repository: EvidenceOperationsRepository,
  ) {}

  async getQueue(): Promise<EvidenceQueueResponse> {
    const items = (await this.repository.list()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const counts = Object.fromEntries(workflowStatuses.map((status) => [status, 0])) as Record<
      EvidenceWorkflowStatus,
      number
    >;
    for (const item of items) counts[item.workflowStatus] += 1;

    return EvidenceQueueResponseSchema.parse({
      items,
      counts,
      generatedAt: new Date().toISOString(),
    });
  }

  async getById(id: string): Promise<EvidenceWorkItem> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Evidence work item '${id}' was not found.`);
    return item;
  }

  async review(id: string, input: unknown, actor: RamaActor): Promise<EvidenceWorkItem> {
    const command = this.parse(ReviewEvidenceCommandSchema, input);
    const item = await this.getVersioned(id, command.expectedVersion);
    if (["expired", "superseded"].includes(item.workflowStatus)) {
      throw new ConflictException(`Cannot review evidence in '${item.workflowStatus}' state.`);
    }

    const nextStatus: EvidenceWorkflowStatus =
      command.decision === "approved"
        ? "approved"
        : command.decision === "rejected"
          ? "draft"
          : "in_review";
    const now = new Date().toISOString();
    item.reviews.push({
      id: randomUUID(),
      decision: command.decision,
      reason: command.reason,
      reviewerId: actor.id,
      createdAt: now,
    });
    return this.transition(item, nextStatus, "reviewed", actor.id, command.reason, now);
  }

  async publish(id: string, input: unknown, actor: RamaActor): Promise<EvidenceWorkItem> {
    const command = this.parse(PublishEvidenceCommandSchema, input);
    const item = await this.getVersioned(id, command.expectedVersion);
    if (item.workflowStatus !== "approved") {
      throw new ConflictException("Evidence must be approved before it can be published.");
    }
    return this.transition(item, "published", "published", actor.id, command.reason);
  }

  async expire(id: string, input: unknown, actor: RamaActor): Promise<EvidenceWorkItem> {
    const command = this.parse(ExpireEvidenceCommandSchema, input);
    const item = await this.getVersioned(id, command.expectedVersion);
    if (item.workflowStatus !== "published") {
      throw new ConflictException("Only published evidence can be expired.");
    }
    item.claim.status = "stale";
    return this.transition(item, "expired", "expired", actor.id, command.reason);
  }

  async autoExpireStaleEvidence(actorId = "system-freshness-scheduler"): Promise<number> {
    const items = await this.repository.list();
    const now = new Date();
    let expiredCount = 0;
    for (const item of items) {
      if (
        item.workflowStatus === "published" &&
        item.claim.validTo &&
        new Date(item.claim.validTo) < now
      ) {
        item.claim.status = "stale";
        await this.transition(
          item,
          "expired",
          "expired",
          actorId,
          "Automated expiry: validTo date has passed.",
          now.toISOString(),
        );
        expiredCount++;
      }
    }
    return expiredCount;
  }

  async requestCorrection(id: string, input: unknown, actor: RamaActor): Promise<EvidenceWorkItem> {
    const command = this.parse(RequestCorrectionCommandSchema, input);
    const item = await this.getVersioned(id, command.expectedVersion);
    if (item.workflowStatus === "superseded") {
      throw new ConflictException("A superseded claim cannot receive a new correction request.");
    }
    const now = new Date().toISOString();
    item.corrections.push({
      id: randomUUID(),
      submittedBy: actor.id,
      reason: command.reason,
      status: "open",
      createdAt: now,
      resolvedAt: null,
      resolutionNote: null,
    });
    return this.transition(item, "in_review", "correction_requested", actor.id, command.reason, now);
  }

  async supersede(id: string, input: unknown, actor: RamaActor): Promise<EvidenceWorkItem> {
    const command = this.parse(SupersedeEvidenceCommandSchema, input);
    const current = await this.getVersioned(id, command.expectedVersion);
    if (current.workflowStatus === "superseded") {
      throw new ConflictException("Evidence has already been superseded.");
    }

    const now = new Date().toISOString();
    await this.transition(current, "superseded", "superseded", actor.id, command.reason, now);

    const replacementId = randomUUID();
    const replacement = EvidenceWorkItemSchema.parse({
      id: replacementId,
      propertySlug: current.propertySlug,
      propertyName: current.propertyName,
      claim: {
        ...command.replacement,
        id: replacementId,
        supersedes: current.claim.id,
      },
      workflowStatus: "approved",
      version: 1,
      assignedTo: actor.id,
      createdAt: now,
      updatedAt: now,
      reviews: [],
      corrections: [],
      auditTrail: [
        {
          id: randomUUID(),
          action: "seeded",
          actorId: actor.id,
          reason: `Replacement for ${current.claim.id}: ${command.reason}`,
          fromStatus: null,
          toStatus: "approved",
          version: 1,
          createdAt: now,
        },
      ],
    });
    return this.persist(replacement, null);
  }

  private async getVersioned(id: string, expectedVersion: number): Promise<EvidenceWorkItem> {
    const item = await this.getById(id);
    if (item.version !== expectedVersion) {
      throw new ConflictException({
        code: "EVIDENCE_VERSION_CONFLICT",
        message: "The evidence changed after this view was loaded.",
        expectedVersion,
        currentVersion: item.version,
      });
    }
    return item;
  }

  private async transition(
    item: EvidenceWorkItem,
    nextStatus: EvidenceWorkflowStatus,
    action: "reviewed" | "published" | "expired" | "correction_requested" | "superseded",
    actorId: string,
    reason: string,
    now = new Date().toISOString(),
  ): Promise<EvidenceWorkItem> {
    const previousStatus = item.workflowStatus;
    const previousVersion = item.version;
    const nextVersion = item.version + 1;
    item.workflowStatus = nextStatus;
    item.version = nextVersion;
    item.updatedAt = now;
    item.assignedTo = nextStatus === "in_review" ? "evidence-queue" : actorId;
    item.auditTrail.push({
      id: randomUUID(),
      action,
      actorId,
      reason,
      fromStatus: previousStatus,
      toStatus: nextStatus,
      version: nextVersion,
      createdAt: now,
    });
    return this.persist(item, previousVersion);
  }

  private async persist(item: EvidenceWorkItem, expectedVersion: number | null): Promise<EvidenceWorkItem> {
    try {
      return await this.repository.save(item, expectedVersion);
    } catch (error) {
      if (error instanceof EvidenceRepositoryConflictError) {
        throw new ConflictException({
          code: "EVIDENCE_VERSION_CONFLICT",
          message: "The evidence changed after this view was loaded.",
          expectedVersion: error.expectedVersion,
          currentVersion: error.currentVersion,
        });
      }
      throw error;
    }
  }

  private parse<T>(schema: ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new BadRequestException({
        code: "INVALID_EVIDENCE_COMMAND",
        issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      });
    }
    return result.data;
  }
}
