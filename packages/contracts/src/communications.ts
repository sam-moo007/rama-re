import { z } from "zod";

export const ContactPointStatusSchema = z.enum(["unverified", "verification_pending", "verified"]);
export const ContactVerificationChannelSchema = z.enum(["email", "sms"]);
export const NotificationDeliveryChannelSchema = z.enum(["in_app", "email", "sms"]);

export const NotificationPreferencesSchema = z.object({
  caseUpdatesInApp: z.literal(true),
  caseUpdatesEmail: z.boolean(),
  caseUpdatesSms: z.boolean(),
  allowInAppFallback: z.boolean(),
});

export const ContactPointSummarySchema = z.object({
  masked: z.string().min(3).max(254),
  status: ContactPointStatusSchema,
  verificationRequestedAt: z.string().datetime().nullable(),
  verifiedAt: z.string().datetime().nullable(),
});

export const ContactProfileEventSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["created", "contact_points_updated", "preferences_updated", "verification_requested", "verification_failed", "contact_verified"]),
  version: z.number().int().positive(),
  channel: ContactVerificationChannelSchema.nullable(),
  createdAt: z.string().datetime(),
});

export const ContactProfileSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive(),
  locale: z.enum(["en", "ar"]),
  email: ContactPointSummarySchema.nullable(),
  phone: ContactPointSummarySchema.nullable(),
  preferences: NotificationPreferencesSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  auditTrail: z.array(ContactProfileEventSchema),
});

export const ContactProfileMineResponseSchema = z.object({
  profile: ContactProfileSchema.nullable(),
  generatedAt: z.string().datetime(),
});

export const ReplaceContactPointsCommandSchema = z.object({
  expectedVersion: z.number().int().positive().nullable(),
  locale: z.enum(["en", "ar"]),
  email: z.string().trim().toLowerCase().email().max(254).nullable(),
  phoneE164: z.string().trim().regex(/^\+[1-9]\d{7,14}$/).nullable(),
}).refine((value) => value.email !== null || value.phoneE164 !== null, "At least one contact point is required.");

export const UpdateNotificationPreferencesCommandSchema = z.object({
  expectedVersion: z.number().int().positive(),
  preferences: NotificationPreferencesSchema,
});

export const RequestContactVerificationCommandSchema = z.object({
  expectedVersion: z.number().int().positive(),
  channel: ContactVerificationChannelSchema,
});

export const ContactVerificationRequestResponseSchema = z.object({
  profile: ContactProfileSchema,
  channel: ContactVerificationChannelSchema,
  expiresAt: z.string().datetime(),
  developmentCode: z.string().regex(/^\d{6}$/).nullable(),
});

export const ConfirmContactVerificationCommandSchema = z.object({
  expectedVersion: z.number().int().positive(),
  channel: ContactVerificationChannelSchema,
  code: z.string().regex(/^\d{6}$/),
});

export const AdvisorMessageTemplateSchema = z.enum([
  "advisor_acknowledgement",
  "information_request",
  "questions_answered",
  "viewing_coordination",
  "financing_follow_up",
]);

export const CustomerNotificationSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  version: z.number().int().positive(),
  template: AdvisorMessageTemplateSchema,
  requestedChannel: NotificationDeliveryChannelSchema,
  deliveredChannel: NotificationDeliveryChannelSchema.nullable(),
  status: z.enum(["queued", "retrying", "delivered", "fallback_delivered", "failed"]),
  deliveryReason: z.enum(["delivery_queued", "direct_in_app", "verified_contact", "contact_missing", "contact_unverified", "channel_opted_out", "fallback_disabled", "provider_failed", "case_unavailable"]),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().nullable(),
  retentionUntil: z.string().datetime(),
});

export const CustomerNotificationListResponseSchema = z.object({
  items: z.array(CustomerNotificationSchema),
  unread: z.number().int().nonnegative(),
  generatedAt: z.string().datetime(),
});

export const SendAdvisorMessageCommandSchema = z.object({
  expectedCaseVersion: z.number().int().positive(),
  template: AdvisorMessageTemplateSchema,
});

export const MarkNotificationReadCommandSchema = z.object({ expectedVersion: z.number().int().positive() });

export type AdvisorMessageTemplate = z.infer<typeof AdvisorMessageTemplateSchema>;
export type ContactProfile = z.infer<typeof ContactProfileSchema>;
export type ContactProfileEvent = z.infer<typeof ContactProfileEventSchema>;
export type ContactVerificationChannel = z.infer<typeof ContactVerificationChannelSchema>;
export type CustomerNotification = z.infer<typeof CustomerNotificationSchema>;
export type CustomerNotificationListResponse = z.infer<typeof CustomerNotificationListResponseSchema>;
export type NotificationDeliveryChannel = z.infer<typeof NotificationDeliveryChannelSchema>;
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
