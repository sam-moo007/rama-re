# ADR 0010: Protected contact and auditable notification delivery

Date: 18 July 2026

Status: Accepted

## Context

Advisor work needs a reliable way to reach a customer, but putting an email address or phone number in a decision case would expose it to advisor browsers, logs and unrelated case workflows. External delivery also needs explicit customer preferences, verified contact points, deterministic fallback and a retained audit record. Free-form advisor messages would create an unnecessary sensitive-content and conduct risk.

## Decision

- Contact profiles are customer-owned records separate from briefs and decision cases. Public contracts return masks, status and audit metadata only.
- Contact values use AES-256-GCM envelope encryption with a random IV and authentication tag. Production and PostgreSQL modes require an explicit canonical 32-byte key; volatile development mode uses an ephemeral key and announces that limitation.
- Verification codes are random six-digit values retained only as keyed HMAC hashes, expire after ten minutes, are rate limited and allow at most five failed attempts.
- External email/SMS delivery is allowed only when the customer enabled that channel and its current contact point is verified. Otherwise the service records an in-app fallback when permitted, or an auditable failure.
- Advisors select one of five versioned structured templates. They never submit message body text or receive the delivery target. Every send rechecks current consent, case version and advisor assignment.
- The production delivery port uses an HTTPS webhook signed with HMAC-SHA256 and a customer-specific idempotency key. Production refuses the development adapter, insecure webhook URLs and short secrets.
- Notification records expose requested channel, delivered channel, result and retention metadata without subjects or protected values. Reads and read-state changes are owner-scoped.
- PostgreSQL stores ciphertext only, appends immutable contact-profile events and removes notifications with the retained decision case.

## Consequences

Advisor browsers can coordinate a case and see delivery status without handling customer contact values. Contact replacement invalidates verification and automatically disables a removed channel. ADR 0011 adds the durable transactional outbox and bounded recovery path; production provider certification and dead-letter operations remain deployment work.
