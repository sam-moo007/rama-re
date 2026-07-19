import { Inject, Injectable, Logger } from "@nestjs/common";

import { type RamaActor } from "../../common/auth/rama-actor";
import { DecisionCaseService } from "../decision-cases/decision-case.service";
import { COMMUNICATIONS_REPOSITORY, type CommunicationsRepository, type NotificationDeliveryJob, type ProtectedNotification } from "./communications.repository";
import { ContactProfileService } from "./contact-profile.service";
import { CONTACT_DELIVERY, type ContactDeliveryPort } from "./contact-delivery.port";

const MAX_ATTEMPTS = 5;
const LEASE_MS = 60_000;

@Injectable()
export class NotificationDeliveryProcessor {
  private readonly logger = new Logger(NotificationDeliveryProcessor.name);
  constructor(
    @Inject(COMMUNICATIONS_REPOSITORY) private readonly repository: CommunicationsRepository,
    private readonly contacts: ContactProfileService,
    private readonly cases: DecisionCaseService,
    @Inject(CONTACT_DELIVERY) private readonly delivery: ContactDeliveryPort,
  ) {}

  async processNotification(notificationId: string, now = new Date()): Promise<ProtectedNotification | null> {
    const at = now.toISOString();
    const job = await this.repository.claimDeliveryJob(notificationId, at, new Date(now.getTime() - LEASE_MS).toISOString());
    return job ? this.processClaimed(job, now) : this.repository.findNotification(notificationId);
  }

  async processDue(now = new Date(), limit = 25): Promise<number> {
    const jobs = await this.repository.claimDueDeliveryJobs(now.toISOString(), new Date(now.getTime() - LEASE_MS).toISOString(), limit);
    for (const job of jobs) await this.processClaimed(job, now);
    return jobs.length;
  }

  private async processClaimed(job: NotificationDeliveryJob, now: Date): Promise<ProtectedNotification | null> {
    const notification = await this.repository.findNotification(job.notificationId);
    if (!notification) return null;
    const actor: RamaActor = { id: notification.advisorSubject, role: "advisor" };
    try {
      await this.cases.advisorDeliveryCase(notification.caseId, notification.caseVersion, actor);
    } catch {
      return this.settle(job, notification, now, { status: "failed", deliveredChannel: null, deliveryReason: "case_unavailable" }, "case_unavailable", true);
    }
    if (notification.requestedChannel !== "email" && notification.requestedChannel !== "sms") {
      return this.settle(job, notification, now, { status: "failed", deliveredChannel: null, deliveryReason: "fallback_disabled" }, "invalid_external_channel", true);
    }
    const target = await this.contacts.deliveryTarget(notification.ownerSubject, notification.requestedChannel);
    if (!target.target) {
      return this.settle(job, notification, now, target.allowFallback
        ? { status: "fallback_delivered", deliveredChannel: "in_app", deliveryReason: target.reason }
        : { status: "failed", deliveredChannel: null, deliveryReason: target.reason }, target.reason, true);
    }
    try {
      await this.delivery.sendCaseUpdate({ channel: notification.requestedChannel, target: target.target, template: notification.template, idempotencyKey: notification.id });
      return this.settle(job, notification, now, { status: "delivered", deliveredChannel: notification.requestedChannel, deliveryReason: "verified_contact" }, null, true);
    } catch (error) {
      const attempts = job.attemptCount + 1;
      const providerError = error instanceof Error ? error.message.slice(0, 300) : "provider_failed";
      if (attempts < MAX_ATTEMPTS) return this.settle(job, notification, now, { status: "retrying", deliveredChannel: null, deliveryReason: "provider_failed" }, providerError, false);
      this.logger.error(`Notification ${notification.id} exhausted external delivery retries.`);
      return this.settle(job, notification, now, target.allowFallback
        ? { status: "fallback_delivered", deliveredChannel: "in_app", deliveryReason: "provider_failed" }
        : { status: "failed", deliveredChannel: null, deliveryReason: "provider_failed" }, providerError, true);
    }
  }

  private settle(
    claimed: NotificationDeliveryJob,
    current: ProtectedNotification,
    now: Date,
    outcome: Pick<ProtectedNotification, "status" | "deliveredChannel" | "deliveryReason">,
    lastError: string | null,
    terminal: boolean,
  ) {
    const attemptCount = claimed.attemptCount + 1;
    const updatedAt = now.toISOString();
    const delayMs = Math.min(15 * 60_000, 30_000 * 2 ** Math.max(0, attemptCount - 1));
    const job: NotificationDeliveryJob = {
      ...claimed,
      status: terminal ? (outcome.status === "failed" ? "dead_letter" : "completed") : "retry_pending",
      attemptCount,
      nextAttemptAt: terminal ? claimed.nextAttemptAt : new Date(now.getTime() + delayMs).toISOString(),
      lockedAt: null,
      lastError,
      updatedAt,
    };
    return this.repository.settleDeliveryJob(job, { ...current, ...outcome, version: current.version + 1 }, current.version);
  }
}
