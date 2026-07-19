import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CustomerNotificationListResponseSchema, CustomerNotificationSchema, MarkNotificationReadCommandSchema, SendAdvisorMessageCommandSchema, type CustomerNotification, type CustomerNotificationListResponse } from "@rama/contracts";
import { randomUUID } from "node:crypto";
import type { ZodType } from "zod";

import type { RamaActor } from "../../common/auth/rama-actor";
import { DecisionCaseService } from "../decision-cases/decision-case.service";
import { COMMUNICATIONS_REPOSITORY, CommunicationsConflictError, type CommunicationsRepository, type NotificationDeliveryJob, type ProtectedNotification } from "./communications.repository";
import { NotificationDeliveryProcessor } from "./notification-delivery.processor";

@Injectable()
export class CommunicationsService {
  constructor(
    @Inject(COMMUNICATIONS_REPOSITORY) private readonly repository: CommunicationsRepository,
    private readonly cases: DecisionCaseService,
    private readonly deliveryProcessor: NotificationDeliveryProcessor,
  ) {}

  async sendAdvisorMessage(caseId: string, input: unknown, actor: RamaActor): Promise<CustomerNotification> {
    const command = this.parse(SendAdvisorMessageCommandSchema, input, "INVALID_ADVISOR_MESSAGE");
    const decisionCase = await this.cases.advisorDeliveryCase(caseId, command.expectedCaseVersion, actor);
    const requestedChannel = decisionCase.preferredContactChannel === "phone" ? "sms" : decisionCase.preferredContactChannel;
    const id = randomUUID();
    const now = new Date().toISOString();
    const external = requestedChannel !== "in_app";
    const notification: ProtectedNotification = {
      id, caseId, ownerSubject: decisionCase.ownerSubject, advisorSubject: actor.id, caseVersion: decisionCase.version, version: 1,
      template: command.template, requestedChannel, deliveredChannel: external ? null : "in_app", status: external ? "queued" : "delivered", deliveryReason: external ? "delivery_queued" : "direct_in_app",
      createdAt: now, readAt: null, retentionUntil: decisionCase.retentionUntil,
    };
    const job: NotificationDeliveryJob | null = external ? { notificationId:id,status:"pending",attemptCount:0,nextAttemptAt:now,lockedAt:null,lastError:null,createdAt:now,updatedAt:now } : null;
    await this.repository.enqueueNotification(notification, job);
    const delivered = job ? await this.deliveryProcessor.processNotification(id) : notification;
    return this.publicNotification(delivered ?? notification);
  }

  async mine(actor: RamaActor): Promise<CustomerNotificationListResponse> {
    const items = (await this.repository.listNotificationsByOwner(actor.id)).map((item) => this.publicNotification(item));
    return CustomerNotificationListResponseSchema.parse({ items, unread: items.filter((item) => item.readAt === null && item.deliveredChannel === "in_app").length, generatedAt: new Date().toISOString() });
  }

  async markRead(id: string, input: unknown, actor: RamaActor): Promise<CustomerNotification> {
    const command = this.parse(MarkNotificationReadCommandSchema, input, "INVALID_NOTIFICATION_READ");
    const current = await this.repository.findNotification(id);
    if (!current || current.ownerSubject !== actor.id) throw new NotFoundException("Notification not found.");
    if (current.version !== command.expectedVersion) throw new ConflictException({ code: "NOTIFICATION_VERSION_CONFLICT", id, expectedVersion: command.expectedVersion, currentVersion: current.version });
    if (current.deliveredChannel !== "in_app") throw new ConflictException({ code: "NOTIFICATION_NOT_IN_APP" });
    if (current.readAt) return this.publicNotification(current);
    return this.publicNotification(await this.save({ ...current, version: current.version + 1, readAt: new Date().toISOString() }, current.version));
  }

  purgeExpired(before = new Date().toISOString(), limit = 250): Promise<number> {
    return this.repository.purgeExpiredNotifications(before, limit);
  }

  private publicNotification(notification: ProtectedNotification): CustomerNotification { return CustomerNotificationSchema.parse(notification); }
  private async save(notification: ProtectedNotification, expectedVersion: number | null) { try { return await this.repository.saveNotification(notification, expectedVersion); } catch (error) { if (error instanceof CommunicationsConflictError) throw new ConflictException({ code: "NOTIFICATION_VERSION_CONFLICT", id: error.id, expectedVersion: error.expectedVersion, currentVersion: error.currentVersion }); throw error; } }
  private parse<T>(schema: ZodType<T>, input: unknown, code: string): T { const result = schema.safeParse(input); if (!result.success) throw new BadRequestException({ code, issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) }); return result.data; }
}
