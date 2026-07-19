import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import {
  ConfirmContactVerificationCommandSchema,
  ContactProfileMineResponseSchema,
  ContactProfileSchema,
  ContactVerificationRequestResponseSchema,
  ReplaceContactPointsCommandSchema,
  RequestContactVerificationCommandSchema,
  UpdateNotificationPreferencesCommandSchema,
  type ContactProfile,
  type ContactVerificationChannel,
} from "@rama/contracts";
import { randomInt, randomUUID } from "node:crypto";
import type { ZodType } from "zod";

import type { RamaActor } from "../../common/auth/rama-actor";
import { COMMUNICATIONS_REPOSITORY, CommunicationsConflictError, pointFor, type CommunicationsRepository, type ProtectedContactPoint, type ProtectedContactProfile } from "./communications.repository";
import { CONTACT_CIPHER, ContactCipher } from "./contact-cipher";
import { CONTACT_DELIVERY, type ContactDeliveryPort } from "./contact-delivery.port";

@Injectable()
export class ContactProfileService {
  constructor(
    @Inject(COMMUNICATIONS_REPOSITORY) private readonly repository: CommunicationsRepository,
    @Inject(CONTACT_CIPHER) private readonly cipher: ContactCipher,
    @Inject(CONTACT_DELIVERY) private readonly delivery: ContactDeliveryPort,
  ) {}

  async mine(actor: RamaActor): Promise<{ profile: ContactProfile | null; generatedAt: string }> {
    const profile = await this.repository.findContactByOwner(actor.id);
    return ContactProfileMineResponseSchema.parse({ profile: profile ? this.publicProfile(profile) : null, generatedAt: new Date().toISOString() });
  }

  async replaceContactPoints(input: unknown, actor: RamaActor): Promise<ContactProfile> {
    const command = this.parse(ReplaceContactPointsCommandSchema, input, "INVALID_CONTACT_POINTS");
    const current = await this.repository.findContactByOwner(actor.id);
    if ((current?.version ?? null) !== command.expectedVersion) throw this.conflict(current?.id ?? actor.id, command.expectedVersion, current?.version ?? null);
    const now = new Date().toISOString();
    const version = (current?.version ?? 0) + 1;
    const next: ProtectedContactProfile = {
      id: current?.id ?? randomUUID(), ownerSubject: actor.id, version, locale: command.locale,
      email: command.email ? this.protect(command.email, current?.email ?? null, "email") : null,
      phone: command.phoneE164 ? this.protect(command.phoneE164, current?.phone ?? null, "sms") : null,
      preferences: current ? { ...current.preferences, caseUpdatesEmail: command.email ? current.preferences.caseUpdatesEmail : false, caseUpdatesSms: command.phoneE164 ? current.preferences.caseUpdatesSms : false } : { caseUpdatesInApp: true, caseUpdatesEmail: false, caseUpdatesSms: false, allowInAppFallback: true },
      createdAt: current?.createdAt ?? now, updatedAt: now,
      auditTrail: [...(current?.auditTrail ?? []), { id: randomUUID(), action: current ? "contact_points_updated" : "created", version, channel: null, createdAt: now }],
    };
    return this.publicProfile(await this.save(next, command.expectedVersion));
  }

  async updatePreferences(input: unknown, actor: RamaActor): Promise<ContactProfile> {
    const command = this.parse(UpdateNotificationPreferencesCommandSchema, input, "INVALID_NOTIFICATION_PREFERENCES");
    const current = await this.required(actor.id);
    if (current.version !== command.expectedVersion) throw this.conflict(current.id, command.expectedVersion, current.version);
    if (command.preferences.caseUpdatesEmail && !current.email) throw new ConflictException({ code: "EMAIL_CONTACT_REQUIRED" });
    if (command.preferences.caseUpdatesSms && !current.phone) throw new ConflictException({ code: "PHONE_CONTACT_REQUIRED" });
    const now = new Date().toISOString();
    const next = { ...current, version: current.version + 1, preferences: command.preferences, updatedAt: now,
      auditTrail: [...current.auditTrail, { id: randomUUID(), action: "preferences_updated" as const, version: current.version + 1, channel: null, createdAt: now }] };
    return this.publicProfile(await this.save(next, current.version));
  }

  async requestVerification(input: unknown, actor: RamaActor) {
    const command = this.parse(RequestContactVerificationCommandSchema, input, "INVALID_VERIFICATION_REQUEST");
    const current = await this.required(actor.id);
    if (current.version !== command.expectedVersion) throw this.conflict(current.id, command.expectedVersion, current.version);
    const point = pointFor(current, command.channel);
    if (!point) throw new ConflictException({ code: "CONTACT_POINT_REQUIRED", channel: command.channel });
    const now = new Date();
    if (point.verificationRequestedAt && Date.parse(point.verificationRequestedAt) > now.getTime() - 60_000) throw new ConflictException({ code: "VERIFICATION_RATE_LIMITED" });
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const expiresAt = new Date(now.getTime() + 10 * 60_000).toISOString();
    const updatedPoint: ProtectedContactPoint = { ...point, status: "verification_pending", verificationCodeHash: this.cipher.verificationHash(current.id, command.channel, code), verificationExpiresAt: expiresAt, verificationAttempts: 0, verificationRequestedAt: now.toISOString(), verifiedAt: null };
    const next = this.withPoint(current, command.channel, updatedPoint, "verification_requested", now.toISOString());
    const saved = await this.save(next, current.version);
    
    await this.delivery.sendVerification({
      channel: command.channel,
      target: this.cipher.decrypt(point.encryptedValue),
      code,
      expiresAt,
      idempotencyKey: `${current.id}:${command.channel}:${current.version + 1}`,
    });
    
    return ContactVerificationRequestResponseSchema.parse({ profile: this.publicProfile(saved), channel: command.channel, expiresAt, developmentCode: this.delivery.development ? code : null });
  }

  async confirmVerification(input: unknown, actor: RamaActor): Promise<ContactProfile> {
    const command = this.parse(ConfirmContactVerificationCommandSchema, input, "INVALID_VERIFICATION_CONFIRMATION");
    const current = await this.required(actor.id);
    if (current.version !== command.expectedVersion) throw this.conflict(current.id, command.expectedVersion, current.version);
    const point = pointFor(current, command.channel);
    if (!point?.verificationCodeHash || !point.verificationExpiresAt || point.status !== "verification_pending") throw new ConflictException({ code: "VERIFICATION_NOT_PENDING" });
    if (Date.parse(point.verificationExpiresAt) <= Date.now()) throw new ConflictException({ code: "VERIFICATION_EXPIRED" });
    if (point.verificationAttempts >= 5) throw new ConflictException({ code: "VERIFICATION_ATTEMPTS_EXHAUSTED" });
    const now = new Date().toISOString();
    if (!this.cipher.matchesVerificationHash(point.verificationCodeHash, current.id, command.channel, command.code)) {
      const failed = this.withPoint(current, command.channel, { ...point, verificationAttempts: point.verificationAttempts + 1 }, "verification_failed", now);
      const saved = await this.save(failed, current.version);
      throw new UnauthorizedException({ code: "VERIFICATION_CODE_INVALID", currentVersion: saved.version });
    }
    const verified: ProtectedContactPoint = { ...point, status: "verified", verificationCodeHash: null, verificationExpiresAt: null, verificationAttempts: 0, verifiedAt: now };
    return this.publicProfile(await this.save(this.withPoint(current, command.channel, verified, "contact_verified", now), current.version));
  }

  async deliveryTarget(ownerSubject: string, channel: ContactVerificationChannel): Promise<{ target: string | null; reason: "verified_contact" | "contact_missing" | "contact_unverified" | "channel_opted_out"; allowFallback: boolean }> {
    const profile = await this.repository.findContactByOwner(ownerSubject);
    if (!profile) return { target: null, reason: "contact_missing", allowFallback: true };
    const enabled = channel === "email" ? profile.preferences.caseUpdatesEmail : profile.preferences.caseUpdatesSms;
    const point = pointFor(profile, channel);
    if (!point) return { target: null, reason: "contact_missing", allowFallback: profile.preferences.allowInAppFallback };
    if (!enabled) return { target: null, reason: "channel_opted_out", allowFallback: profile.preferences.allowInAppFallback };
    if (point.status !== "verified") return { target: null, reason: "contact_unverified", allowFallback: profile.preferences.allowInAppFallback };
    return { target: this.cipher.decrypt(point.encryptedValue), reason: "verified_contact", allowFallback: profile.preferences.allowInAppFallback };
  }

  private protect(value: string, current: ProtectedContactPoint | null, channel: ContactVerificationChannel): ProtectedContactPoint {
    if (current && this.cipher.decrypt(current.encryptedValue) === value) return current;
    return { encryptedValue: this.cipher.encrypt(value), masked: channel === "email" ? this.maskEmail(value) : this.maskPhone(value), status: "unverified", verificationCodeHash: null, verificationExpiresAt: null, verificationAttempts: 0, verificationRequestedAt: null, verifiedAt: null };
  }

  private withPoint(current: ProtectedContactProfile, channel: ContactVerificationChannel, point: ProtectedContactPoint, action: "verification_requested" | "verification_failed" | "contact_verified", now: string): ProtectedContactProfile {
    return { ...current, version: current.version + 1, email: channel === "email" ? point : current.email, phone: channel === "sms" ? point : current.phone, updatedAt: now,
      auditTrail: [...current.auditTrail, { id: randomUUID(), action, version: current.version + 1, channel, createdAt: now }] };
  }

  private publicProfile(profile: ProtectedContactProfile): ContactProfile {
    const summarize = (point: ProtectedContactPoint | null) => point ? { masked: point.masked, status: point.status, verificationRequestedAt: point.verificationRequestedAt, verifiedAt: point.verifiedAt } : null;
    return ContactProfileSchema.parse({ id: profile.id, version: profile.version, locale: profile.locale, email: summarize(profile.email), phone: summarize(profile.phone), preferences: profile.preferences, createdAt: profile.createdAt, updatedAt: profile.updatedAt, auditTrail: profile.auditTrail });
  }

  private async required(ownerSubject: string): Promise<ProtectedContactProfile> {
    const profile = await this.repository.findContactByOwner(ownerSubject);
    if (!profile) throw new NotFoundException("Contact profile not found.");
    return profile;
  }

  private async save(profile: ProtectedContactProfile, expectedVersion: number | null): Promise<ProtectedContactProfile> {
    try { return await this.repository.saveContact(profile, expectedVersion); }
    catch (error) { if (error instanceof CommunicationsConflictError) throw this.conflict(error.id, error.expectedVersion, error.currentVersion); throw error; }
  }

  private conflict(id: string, expectedVersion: number | null, currentVersion: number | null) { return new ConflictException({ code: "CONTACT_PROFILE_VERSION_CONFLICT", id, expectedVersion, currentVersion }); }
  private parse<T>(schema: ZodType<T>, input: unknown, code: string): T { const result = schema.safeParse(input); if (!result.success) throw new BadRequestException({ code, issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) }); return result.data; }
  private maskEmail(value: string): string { const [local, domain] = value.split("@"); return `${local?.slice(0, 1) ?? "*"}***@${domain}`; }
  private maskPhone(value: string): string { return `${value.slice(0, 4)} ${"*".repeat(Math.max(4, value.length - 6))}${value.slice(-2)}`; }
}
