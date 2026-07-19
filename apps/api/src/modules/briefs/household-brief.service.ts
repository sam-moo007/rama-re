import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateHouseholdBriefCommandSchema,
  AmendHouseholdBriefConsentCommandSchema,
  HouseholdBriefListResponseSchema,
  HouseholdBriefSchema,
  HouseholdReadinessSchema,
  SubmitHouseholdBriefCommandSchema,
  UpdateHouseholdBriefCommandSchema,
  type HouseholdBrief,
  type HouseholdBriefInput,
  type HouseholdBriefListResponse,
  type HouseholdReadiness,
} from "@rama/contracts";
import { randomUUID } from "node:crypto";
import type { ZodType } from "zod";

import type { RamaActor } from "../../common/auth/rama-actor";
import {
  HOUSEHOLD_BRIEF_REPOSITORY,
  HouseholdBriefConflictError,
  type HouseholdBriefRepository,
} from "./household-brief.repository";

@Injectable()
export class HouseholdBriefService {
  constructor(
    @Inject(HOUSEHOLD_BRIEF_REPOSITORY)
    private readonly repository: HouseholdBriefRepository,
  ) {}

  async create(input: unknown, actor: RamaActor): Promise<HouseholdBrief> {
    const command = this.parse(CreateHouseholdBriefCommandSchema, input);
    const now = new Date().toISOString();
    const brief = HouseholdBriefSchema.parse({
      id: randomUUID(),
      ownerSubject: actor.id,
      status: "draft",
      version: 1,
      input: command.input,
      readiness: this.calculateReadiness(command.input, now),
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      auditTrail: [
        {
          id: randomUUID(),
          action: "created",
          actorId: actor.id,
          reason: "Customer created a structured household brief.",
          version: 1,
          createdAt: now,
        },
      ],
    });
    return this.save(brief, null);
  }

  async listMine(actor: RamaActor): Promise<HouseholdBriefListResponse> {
    return HouseholdBriefListResponseSchema.parse({
      items: await this.repository.listByOwner(actor.id),
      generatedAt: new Date().toISOString(),
    });
  }

  async get(id: string, actor: RamaActor): Promise<HouseholdBrief> {
    return this.getForOwner(id, actor.id);
  }

  async getForOwner(id: string, ownerSubject: string): Promise<HouseholdBrief> {
    const brief = await this.repository.find(id);
    if (!brief || brief.ownerSubject !== ownerSubject) throw new NotFoundException("Household brief not found.");
    return brief;
  }

  async isAdvisorContactAllowed(id: string, ownerSubject: string): Promise<boolean> {
    try {
      const brief = await this.getForOwner(id, ownerSubject);
      return brief.status === "submitted" && brief.input.consent.advisorContactAllowed;
    } catch (error) {
      if (error instanceof NotFoundException) return false;
      throw error;
    }
  }

  async update(id: string, input: unknown, actor: RamaActor): Promise<HouseholdBrief> {
    const command = this.parse(UpdateHouseholdBriefCommandSchema, input);
    const current = await this.get(id, actor);
    if (current.version !== command.expectedVersion) throw this.conflict(id, command.expectedVersion, current.version);
    const now = new Date().toISOString();
    const next = HouseholdBriefSchema.parse({
      ...current,
      status: "draft",
      version: current.version + 1,
      input: command.input,
      readiness: this.calculateReadiness(command.input, now),
      updatedAt: now,
      submittedAt: null,
      auditTrail: [
        ...current.auditTrail,
        {
          id: randomUUID(),
          action: "updated",
          actorId: actor.id,
          reason: "Customer updated structured household constraints.",
          version: current.version + 1,
          createdAt: now,
        },
      ],
    });
    return this.save(next, current.version);
  }

  async submit(id: string, input: unknown, actor: RamaActor): Promise<HouseholdBrief> {
    const command = this.parse(SubmitHouseholdBriefCommandSchema, input);
    const current = await this.get(id, actor);
    if (current.version !== command.expectedVersion) throw this.conflict(id, command.expectedVersion, current.version);
    if (current.status === "submitted") {
      throw new ConflictException({ code: "BRIEF_ALREADY_SUBMITTED", message: "The brief is already submitted." });
    }
    const now = new Date().toISOString();
    const next = HouseholdBriefSchema.parse({
      ...current,
      status: "submitted",
      version: current.version + 1,
      updatedAt: now,
      submittedAt: now,
      auditTrail: [
        ...current.auditTrail,
        {
          id: randomUUID(),
          action: "submitted",
          actorId: actor.id,
          reason: "Customer confirmed the brief for decision support.",
          version: current.version + 1,
          createdAt: now,
        },
      ],
    });
    return this.save(next, current.version);
  }

  async amendConsent(id: string, input: unknown, actor: RamaActor): Promise<HouseholdBrief> {
    const command = this.parse(AmendHouseholdBriefConsentCommandSchema, input);
    const current = await this.get(id, actor);
    if (current.version !== command.expectedVersion) throw this.conflict(id, command.expectedVersion, current.version);
    const now = new Date().toISOString();
    const next = HouseholdBriefSchema.parse({
      ...current,
      version: current.version + 1,
      input: {
        ...current.input,
        consent: {
          processingAccepted: true,
          advisorContactAllowed: command.advisorContactAllowed,
          anonymousAnalyticsAllowed: command.anonymousAnalyticsAllowed,
        },
      },
      updatedAt: now,
      auditTrail: [
        ...current.auditTrail,
        {
          id: randomUUID(),
          action: "consent_updated",
          actorId: actor.id,
          reason: command.reason === "advisor_handoff"
            ? "Customer updated optional consent for an advisor handoff."
            : "Customer updated optional consent preferences.",
          version: current.version + 1,
          createdAt: now,
        },
      ],
    });
    return this.save(next, current.version);
  }

  calculateReadiness(input: HouseholdBriefInput, calculatedAt = new Date().toISOString()): HouseholdReadiness {
    const costs = Math.round(input.maxPurchasePriceAed * 0.075);
    const downPayment = input.financingNeeded
      ? Math.round(input.maxPurchasePriceAed * 0.2)
      : input.maxPurchasePriceAed;
    const minimumCash = costs + downPayment;
    const cashGap = Math.max(0, minimumCash - input.availableCashAed);
    const loan = input.financingNeeded ? input.maxPurchasePriceAed - downPayment : 0;
    const monthlyRate = 0.045 / 12;
    const payments = 25 * 12;
    const illustrativeMonthly = input.financingNeeded
      ? Math.round((loan * monthlyRate * (1 + monthlyRate) ** payments) / ((1 + monthlyRate) ** payments - 1))
      : null;
    const paymentReview =
      illustrativeMonthly !== null &&
      input.comfortableMonthlyPaymentAed !== null &&
      illustrativeMonthly > input.comfortableMonthlyPaymentAed;
    const blockers: HouseholdReadiness["blockers"] = [];
    if (cashGap > 0) blockers.push("cash_shortfall");
    if (paymentReview) blockers.push("payment_comfort_review");
    const classification = cashGap > 0 ? "cash_gap" : paymentReview ? "finance_review" : "cash_ready";
    return HouseholdReadinessSchema.parse({
      classification,
      estimatedMinimumCashAed: minimumCash,
      estimatedAcquisitionCostsAed: costs,
      estimatedDownPaymentAed: downPayment,
      estimatedIllustrativeMonthlyPaymentAed: illustrativeMonthly,
      cashGapAed: cashGap,
      assumedLoanToValuePercent: input.financingNeeded ? 80 : null,
      assumedAcquisitionCostPercent: 7.5,
      blockers,
      assumptionVersion: "rama.readiness.phase0.v1",
      disclaimer: {
        en: "Illustrative planning only—not mortgage approval, legal, tax, valuation or investment advice. Fees and eligibility require current professional review.",
        ar: "لأغراض التخطيط التوضيحي فقط، وليس موافقة تمويلية أو مشورة قانونية أو ضريبية أو تقييمية أو استثمارية. يجب مراجعة الرسوم والأهلية مهنياً وفق القواعد الحالية.",
      },
      calculatedAt,
    });
  }

  private async save(brief: HouseholdBrief, expectedVersion: number | null): Promise<HouseholdBrief> {
    try {
      return await this.repository.save(brief, expectedVersion);
    } catch (error) {
      if (error instanceof HouseholdBriefConflictError) {
        throw this.conflict(error.briefId, error.expectedVersion, error.currentVersion);
      }
      throw error;
    }
  }

  private conflict(id: string, expectedVersion: number | null, currentVersion: number | null): ConflictException {
    return new ConflictException({
      code: "BRIEF_VERSION_CONFLICT",
      message: "The household brief changed after this view was loaded.",
      id,
      expectedVersion,
      currentVersion,
    });
  }

  private parse<T>(schema: ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new BadRequestException({
        code: "INVALID_HOUSEHOLD_BRIEF",
        issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      });
    }
    return result.data;
  }
}
