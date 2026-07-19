import { CustomerNotificationSchema } from "@rama/contracts";

import { CommunicationsConflictError, type CommunicationsRepository, type NotificationDeliveryJob, type ProtectedContactProfile, type ProtectedNotification } from "./communications.repository";

export class InMemoryCommunicationsRepository implements CommunicationsRepository {
  private readonly contacts = new Map<string, ProtectedContactProfile>();
  private readonly notifications = new Map<string, ProtectedNotification>();
  private readonly deliveryJobs = new Map<string, NotificationDeliveryJob>();

  async findContactByOwner(ownerSubject: string): Promise<ProtectedContactProfile | null> {
    const profile = this.contacts.get(ownerSubject);
    return profile ? structuredClone(profile) : null;
  }

  async saveContact(profile: ProtectedContactProfile, expectedVersion: number | null): Promise<ProtectedContactProfile> {
    const current = this.contacts.get(profile.ownerSubject);
    const currentVersion = current?.version ?? null;
    if (currentVersion !== expectedVersion || profile.version !== (expectedVersion ?? 0) + 1) throw new CommunicationsConflictError(profile.id, expectedVersion, currentVersion);
    const appended = profile.auditTrail.filter((event) => expectedVersion === null || event.version > expectedVersion);
    if (appended.length !== 1 || appended[0]?.version !== profile.version) throw new Error("Each contact-profile save must append exactly one audit event.");
    this.contacts.set(profile.ownerSubject, structuredClone(profile));
    return structuredClone(profile);
  }

  async findNotification(id: string): Promise<ProtectedNotification | null> {
    const notification = this.notifications.get(id);
    return notification ? structuredClone(notification) : null;
  }

  async listNotificationsByOwner(ownerSubject: string): Promise<ProtectedNotification[]> {
    return structuredClone([...this.notifications.values()].filter((item) => item.ownerSubject === ownerSubject).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async saveNotification(notification: ProtectedNotification, expectedVersion: number | null): Promise<ProtectedNotification> {
    CustomerNotificationSchema.parse(notification);
    const current = this.notifications.get(notification.id);
    const currentVersion = current?.version ?? null;
    if (currentVersion !== expectedVersion || notification.version !== (expectedVersion ?? 0) + 1) throw new CommunicationsConflictError(notification.id, expectedVersion, currentVersion);
    this.notifications.set(notification.id, structuredClone(notification));
    return structuredClone(notification);
  }

  async enqueueNotification(notification: ProtectedNotification, job: NotificationDeliveryJob | null): Promise<ProtectedNotification> {
    if (this.notifications.has(notification.id) || this.deliveryJobs.has(notification.id)) throw new CommunicationsConflictError(notification.id, null, this.notifications.get(notification.id)?.version ?? null);
    CustomerNotificationSchema.parse(notification);
    if (notification.version !== 1 || (job && (job.notificationId !== notification.id || job.status !== "pending" || job.attemptCount !== 0))) throw new Error("Invalid notification outbox enqueue state.");
    this.notifications.set(notification.id, structuredClone(notification));
    if (job) this.deliveryJobs.set(job.notificationId, structuredClone(job));
    return structuredClone(notification);
  }

  async claimDeliveryJob(notificationId: string, now: string, staleBefore: string): Promise<NotificationDeliveryJob | null> {
    const job = this.deliveryJobs.get(notificationId);
    if (!job || !this.claimable(job, now, staleBefore)) return null;
    const claimed = { ...job, status: "processing" as const, lockedAt: now, updatedAt: now };
    this.deliveryJobs.set(notificationId, claimed);
    return structuredClone(claimed);
  }

  async claimDueDeliveryJobs(now: string, staleBefore: string, limit: number): Promise<NotificationDeliveryJob[]> {
    const due = [...this.deliveryJobs.values()].filter((job) => this.claimable(job, now, staleBefore)).sort((a,b)=>a.nextAttemptAt.localeCompare(b.nextAttemptAt)).slice(0,limit);
    return Promise.all(due.map((job) => this.claimDeliveryJob(job.notificationId, now, staleBefore))).then((jobs) => jobs.filter((job): job is NotificationDeliveryJob => job !== null));
  }

  async settleDeliveryJob(job: NotificationDeliveryJob, notification: ProtectedNotification, expectedNotificationVersion: number): Promise<ProtectedNotification> {
    const currentJob = this.deliveryJobs.get(job.notificationId); const current = this.notifications.get(notification.id);
    if (!currentJob || currentJob.status !== "processing" || !current || current.version !== expectedNotificationVersion || notification.version !== expectedNotificationVersion + 1) throw new CommunicationsConflictError(notification.id, expectedNotificationVersion, current?.version ?? null);
    CustomerNotificationSchema.parse(notification);
    this.notifications.set(notification.id, structuredClone(notification)); this.deliveryJobs.set(job.notificationId, structuredClone(job));
    return structuredClone(notification);
  }

  async findDeliveryJob(notificationId: string): Promise<NotificationDeliveryJob | null> { const job=this.deliveryJobs.get(notificationId); return job?structuredClone(job):null; }

  async purgeExpiredNotifications(before: string, limit: number): Promise<number> {
    const expired = [...this.notifications.values()].filter((item) => item.retentionUntil <= before).sort((a, b) => a.retentionUntil.localeCompare(b.retentionUntil)).slice(0, limit);
    for (const item of expired) { this.notifications.delete(item.id); this.deliveryJobs.delete(item.id); }
    return expired.length;
  }

  private claimable(job: NotificationDeliveryJob, now: string, staleBefore: string) { return ((job.status === "pending" || job.status === "retry_pending") && job.nextAttemptAt <= now) || (job.status === "processing" && job.lockedAt !== null && job.lockedAt <= staleBefore); }
}
