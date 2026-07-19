import type { ContactProfileEvent, ContactVerificationChannel, CustomerNotification, NotificationPreferences } from "@rama/contracts";

export const COMMUNICATIONS_REPOSITORY = Symbol("COMMUNICATIONS_REPOSITORY");

export type ProtectedContactPoint = {
  encryptedValue: string;
  masked: string;
  status: "unverified" | "verification_pending" | "verified";
  verificationCodeHash: string | null;
  verificationExpiresAt: string | null;
  verificationAttempts: number;
  verificationRequestedAt: string | null;
  verifiedAt: string | null;
};

export type ProtectedContactProfile = {
  id: string;
  ownerSubject: string;
  version: number;
  locale: "en" | "ar";
  email: ProtectedContactPoint | null;
  phone: ProtectedContactPoint | null;
  preferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
  auditTrail: ContactProfileEvent[];
};

export type ProtectedNotification = CustomerNotification & {
  ownerSubject: string;
  advisorSubject: string;
  caseVersion: number;
};

export type NotificationDeliveryJob = {
  notificationId: string;
  status: "pending" | "processing" | "retry_pending" | "completed" | "dead_letter";
  attemptCount: number;
  nextAttemptAt: string;
  lockedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export class CommunicationsConflictError extends Error {
  constructor(readonly id: string, readonly expectedVersion: number | null, readonly currentVersion: number | null) {
    super(`Communication record '${id}' changed while it was being saved.`);
    this.name = "CommunicationsConflictError";
  }
}

export interface CommunicationsRepository {
  findContactByOwner(ownerSubject: string): Promise<ProtectedContactProfile | null>;
  saveContact(profile: ProtectedContactProfile, expectedVersion: number | null): Promise<ProtectedContactProfile>;
  findNotification(id: string): Promise<ProtectedNotification | null>;
  listNotificationsByOwner(ownerSubject: string): Promise<ProtectedNotification[]>;
  saveNotification(notification: ProtectedNotification, expectedVersion: number | null): Promise<ProtectedNotification>;
  enqueueNotification(notification: ProtectedNotification, job: NotificationDeliveryJob | null): Promise<ProtectedNotification>;
  claimDeliveryJob(notificationId: string, now: string, staleBefore: string): Promise<NotificationDeliveryJob | null>;
  claimDueDeliveryJobs(now: string, staleBefore: string, limit: number): Promise<NotificationDeliveryJob[]>;
  settleDeliveryJob(job: NotificationDeliveryJob, notification: ProtectedNotification, expectedNotificationVersion: number): Promise<ProtectedNotification>;
  findDeliveryJob(notificationId: string): Promise<NotificationDeliveryJob | null>;
  purgeExpiredNotifications(before: string, limit: number): Promise<number>;
}

export const pointFor = (profile: ProtectedContactProfile, channel: ContactVerificationChannel): ProtectedContactPoint | null =>
  channel === "email" ? profile.email : profile.phone;
