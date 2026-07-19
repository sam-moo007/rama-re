import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  AdvisorCaseContextResponseSchema,
  AdvisorCaseQueueResponseSchema,
  AdvisorConsentWithdrawalResponseSchema,
  AdvisorDecisionCaseSchema,
  CancelDecisionCaseCommandSchema,
  ClaimDecisionCaseCommandSchema,
  CloseDecisionCaseCommandSchema,
  CreateDecisionCaseCommandSchema,
  DecisionCaseListResponseSchema,
  DecisionCaseSchema,
  WithdrawAdvisorConsentCommandSchema,
  type AdvisorCaseContextResponse,
  type AdvisorCaseQueueResponse,
  type AdvisorConsentWithdrawalResponse,
  type AdvisorDecisionCase,
  type DecisionCase,
  type DecisionCaseListResponse,
} from "@rama/contracts";
import { randomUUID } from "node:crypto";
import type { ZodType } from "zod";

import type { RamaActor } from "../../common/auth/rama-actor";
import { HouseholdBriefService } from "../briefs/household-brief.service";
import { ShortlistService } from "../shortlists/shortlist.service";
import { DECISION_CASE_REPOSITORY, DecisionCaseConflictError, type DecisionCaseRepository } from "./decision-case.repository";

@Injectable()
export class DecisionCaseService {
  constructor(
    @Inject(DECISION_CASE_REPOSITORY) private readonly repository: DecisionCaseRepository,
    private readonly briefs: HouseholdBriefService,
    private readonly shortlists: ShortlistService,
  ) {}

  async create(input: unknown, actor: RamaActor): Promise<DecisionCase> {
    const command = this.parse(CreateDecisionCaseCommandSchema, input, "INVALID_DECISION_CASE");
    const active = (await this.repository.listByOwner(actor.id)).find((item) => item.status === "requested" || item.status === "assigned");
    if (active) throw new ConflictException({ code: "ACTIVE_DECISION_CASE_EXISTS", caseId: active.id });
    const brief = await this.briefs.get(command.briefId, actor);
    if (brief.status !== "submitted") throw new ConflictException({ code: "BRIEF_NOT_SUBMITTED" });
    if (!brief.input.consent.advisorContactAllowed) throw new ConflictException({ code: "ADVISOR_CONTACT_CONSENT_REQUIRED" });
    const shortlist = (await this.shortlists.getMine(actor)).shortlist;
    if (!shortlist) throw new ConflictException({ code: "SHORTLIST_REQUIRED" });
    if (shortlist.version !== command.shortlistVersion) {
      throw new ConflictException({ code: "SHORTLIST_VERSION_CONFLICT", expectedVersion: command.shortlistVersion, currentVersion: shortlist.version });
    }
    if (!command.propertySlugs.every((slug) => shortlist.propertySlugs.includes(slug))) {
      throw new BadRequestException({ code: "CASE_PROPERTY_NOT_SHORTLISTED" });
    }
    const now = new Date();
    const due = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const retention = new Date(now);
    retention.setUTCDate(retention.getUTCDate() + 180);
    const iso = now.toISOString();
    const decisionCase = DecisionCaseSchema.parse({
      id: randomUUID(),
      ownerSubject: actor.id,
      status: "requested",
      version: 1,
      briefId: brief.id,
      briefVersion: brief.version,
      shortlistId: shortlist.id,
      shortlistVersion: shortlist.version,
      propertySlugs: command.propertySlugs,
      reason: command.reason,
      topics: command.topics,
      preferredContactChannel: command.preferredContactChannel,
      advisorId: null,
      responseSlaHours: 4,
      responseDueAt: due.toISOString(),
      assignedAt: null,
      closedAt: null,
      retentionUntil: retention.toISOString(),
      dataPolicyVersion: "rama.customer-handoff.phase1.v1",
      advisorContext: {
        snapshotVersion: "rama.advisor-context.v1",
        capturedAt: iso,
        purchasePurpose: brief.input.purchasePurpose,
        moveTimeframe: brief.input.moveTimeframe,
        maxPurchasePriceAed: brief.input.maxPurchasePriceAed,
        financingNeeded: brief.input.financingNeeded,
        minBedrooms: brief.input.minBedrooms,
        preferredCommunities: brief.input.preferredCommunities,
        tenurePreference: brief.input.tenurePreference,
        priorities: brief.input.priorities,
        accessibility: brief.input.accessibility,
        readiness: {
          classification: brief.readiness.classification,
          blockers: brief.readiness.blockers,
          assumptionVersion: brief.readiness.assumptionVersion,
          disclaimer: brief.readiness.disclaimer,
        },
      },
      createdAt: iso,
      updatedAt: iso,
      auditTrail: [{ id: randomUUID(), action: "requested", actorId: actor.id, actorRole: "customer", version: 1, reasonCode: command.reason, createdAt: iso }],
    });
    return this.save(decisionCase, null);
  }

  async listMine(actor: RamaActor): Promise<DecisionCaseListResponse> {
    return DecisionCaseListResponseSchema.parse({ items: await this.repository.listByOwner(actor.id), generatedAt: new Date().toISOString() });
  }

  async cancel(id: string, input: unknown, actor: RamaActor): Promise<DecisionCase> {
    const command = this.parse(CancelDecisionCaseCommandSchema, input, "INVALID_CASE_CANCELLATION");
    const current = await this.findOwned(id, actor.id);
    if (current.version !== command.expectedVersion) throw this.conflict(id, command.expectedVersion, current.version);
    if (current.status !== "requested" && current.status !== "assigned") throw new ConflictException({ code: "CASE_NOT_CANCELLABLE" });
    return this.transition(current, actor, "cancelled", "cancelled", command.reason);
  }

  async advisorQueue(actor: RamaActor, now = new Date()): Promise<AdvisorCaseQueueResponse> {
    const candidates = await this.repository.listAdvisorQueue(actor.id);
    const permitted = await Promise.all(candidates.map(async (item) => ({
      item,
      allowed: item.advisorContext !== null && await this.briefs.isAdvisorContactAllowed(item.briefId, item.ownerSubject),
    })));
    const items = permitted.filter(({ allowed }) => allowed).map(({ item }) => this.redactForAdvisor(item));
    return AdvisorCaseQueueResponseSchema.parse({
      items,
      metrics: {
        requested: items.filter((item) => item.status === "requested").length,
        assigned: items.filter((item) => item.status === "assigned").length,
        overdue: items.filter((item) => item.status === "requested" && item.responseDueAt < now.toISOString()).length,
      },
      generatedAt: now.toISOString(),
    });
  }

  async claim(id: string, input: unknown, actor: RamaActor): Promise<AdvisorDecisionCase> {
    const command = this.parse(ClaimDecisionCaseCommandSchema, input, "INVALID_CASE_CLAIM");
    const current = await this.find(id);
    if (!await this.briefs.isAdvisorContactAllowed(current.briefId, current.ownerSubject)) throw new NotFoundException("Decision case not found.");
    if (current.version !== command.expectedVersion) throw this.conflict(id, command.expectedVersion, current.version);
    if (current.status !== "requested" || current.advisorId !== null) throw new ConflictException({ code: "CASE_NOT_CLAIMABLE" });
    const now = new Date().toISOString();
    const next = DecisionCaseSchema.parse({
      ...current,
      status: "assigned",
      version: current.version + 1,
      advisorId: actor.id,
      assignedAt: now,
      updatedAt: now,
      auditTrail: [...current.auditTrail, { id: randomUUID(), action: "claimed", actorId: actor.id, actorRole: "advisor", version: current.version + 1, reasonCode: "advisor_self_assignment", createdAt: now }],
    });
    return this.redactForAdvisor(await this.save(next, current.version));
  }

  async close(id: string, input: unknown, actor: RamaActor): Promise<AdvisorDecisionCase> {
    const command = this.parse(CloseDecisionCaseCommandSchema, input, "INVALID_CASE_CLOSE");
    const current = await this.find(id);
    if (current.status !== "assigned" || current.advisorId !== actor.id) throw new NotFoundException("Decision case not found.");
    if (!await this.briefs.isAdvisorContactAllowed(current.briefId, current.ownerSubject)) throw new NotFoundException("Decision case not found.");
    if (current.version !== command.expectedVersion) throw this.conflict(id, command.expectedVersion, current.version);
    return this.redactForAdvisor(await this.transition(current, actor, "closed", "closed", command.outcome));
  }

  async advisorContext(id: string, actor: RamaActor): Promise<AdvisorCaseContextResponse> {
    const current = await this.find(id);
    const visible = (current.status === "requested" && current.advisorId === null)
      || (current.status === "assigned" && current.advisorId === actor.id);
    if (!visible || !current.advisorContext || !await this.briefs.isAdvisorContactAllowed(current.briefId, current.ownerSubject)) {
      throw new NotFoundException("Decision case not found.");
    }
    return AdvisorCaseContextResponseSchema.parse({
      caseId: current.id,
      caseVersion: current.version,
      briefId: current.briefId,
      briefVersion: current.briefVersion,
      context: current.advisorContext,
      generatedAt: new Date().toISOString(),
    });
  }

  async advisorDeliveryCase(id: string, expectedVersion: number, actor: RamaActor): Promise<DecisionCase> {
    const current = await this.find(id);
    if (current.status !== "assigned" || current.advisorId !== actor.id) throw new NotFoundException("Decision case not found.");
    if (!await this.briefs.isAdvisorContactAllowed(current.briefId, current.ownerSubject)) throw new NotFoundException("Decision case not found.");
    if (current.version !== expectedVersion) throw this.conflict(id, expectedVersion, current.version);
    return current;
  }

  async withdrawAdvisorConsent(input: unknown, actor: RamaActor): Promise<AdvisorConsentWithdrawalResponse> {
    const command = this.parse(WithdrawAdvisorConsentCommandSchema, input, "INVALID_ADVISOR_CONSENT_WITHDRAWAL");
    const brief = await this.briefs.amendConsent(command.briefId, {
      expectedVersion: command.expectedBriefVersion,
      advisorContactAllowed: false,
      anonymousAnalyticsAllowed: command.anonymousAnalyticsAllowed,
      reason: "preference_change",
    }, actor);
    let cancelledCaseId: string | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const active = (await this.repository.listByOwner(actor.id)).find((item) =>
        item.briefId === brief.id && (item.status === "requested" || item.status === "assigned"));
      if (!active) break;
      try {
        const cancelled = await this.transition(active, actor, "cancelled", "cancelled", "privacy_preference");
        cancelledCaseId = cancelled.id;
        break;
      } catch (error) {
        if (!(error instanceof ConflictException) || attempt === 2) throw error;
      }
    }
    return AdvisorConsentWithdrawalResponseSchema.parse({ brief, cancelledCaseId, effectiveAt: brief.updatedAt });
  }

  async purgeExpired(before = new Date().toISOString(), limit = 100): Promise<number> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new BadRequestException({ code: "INVALID_RETENTION_BATCH" });
    return this.repository.purgeExpired(before, limit);
  }

  private async find(id: string): Promise<DecisionCase> {
    const item = await this.repository.find(id);
    if (!item) throw new NotFoundException("Decision case not found.");
    return item;
  }

  private async findOwned(id: string, ownerSubject: string): Promise<DecisionCase> {
    const item = await this.repository.find(id);
    if (!item || item.ownerSubject !== ownerSubject) throw new NotFoundException("Decision case not found.");
    return item;
  }

  private transition(current: DecisionCase, actor: RamaActor, status: "cancelled" | "closed", action: "cancelled" | "closed", reasonCode: string): Promise<DecisionCase> {
    const now = new Date().toISOString();
    const next = DecisionCaseSchema.parse({
      ...current,
      status,
      version: current.version + 1,
      updatedAt: now,
      closedAt: now,
      auditTrail: [...current.auditTrail, { id: randomUUID(), action, actorId: actor.id, actorRole: actor.role, version: current.version + 1, reasonCode, createdAt: now }],
    });
    return this.save(next, current.version);
  }

  private redactForAdvisor(item: DecisionCase): AdvisorDecisionCase {
    const { ownerSubject: _ownerSubject, advisorId: _advisorId, advisorContext: _advisorContext, auditTrail, ...safe } = item;
    return AdvisorDecisionCaseSchema.parse({
      ...safe,
      auditTrail: auditTrail.map(({ actorId: _actorId, ...event }) => event),
    });
  }

  private async save(item: DecisionCase, expectedVersion: number | null): Promise<DecisionCase> {
    try { return await this.repository.save(item, expectedVersion); }
    catch (error) {
      if (error instanceof DecisionCaseConflictError) throw this.conflict(error.caseId, error.expectedVersion, error.currentVersion);
      throw error;
    }
  }

  private conflict(id: string, expectedVersion: number | null, currentVersion: number | null): ConflictException {
    return new ConflictException({ code: "DECISION_CASE_VERSION_CONFLICT", id, expectedVersion, currentVersion });
  }

  private parse<T>(schema: ZodType<T>, input: unknown, code: string): T {
    const result = schema.safeParse(input);
    if (!result.success) throw new BadRequestException({ code, issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) });
    return result.data;
  }
}
