# ADR 0011: Transactional notification delivery outbox

Date: 18 July 2026

Status: Accepted

## Context

ADR 0010 established a protected delivery port, but an external provider call followed by a separate notification save could lose the audit record after a successful send or lose the send after a successful save. Provider outages also fell back immediately instead of allowing bounded recovery. Delivery must survive process restarts without putting plaintext contact targets into a job table.

## Decision

- Every external advisor update atomically inserts a safe customer notification and an outbox job before contacting a provider.
- The job stores only the notification reference, state, attempt count, schedule, lease and bounded error; it never stores email addresses, phone numbers or message bodies.
- A worker claims due jobs with row locks, `SKIP LOCKED` and a one-minute stale-lease recovery window. Work is bounded to 25 jobs per sweep.
- Delivery rechecks the exact decision-case version, current advisor assignment, current customer consent, current channel preference and current contact verification after claim.
- Provider calls reuse the notification UUID as their idempotency key. Failures retry up to five attempts with exponential backoff beginning at 30 seconds and capped at 15 minutes.
- Each attempt atomically versions the public notification and settles or reschedules the job. Terminal provider failure uses in-app fallback when currently permitted; otherwise it dead-letters with a safe failure reason.
- Customer and advisor transports expose queued/retrying/delivered/fallback/failed state only. Lease, attempt, error and subject fields remain internal.

## Consequences

An API or provider crash can be reconciled without duplicating the logical update or losing its customer-visible audit record. Multiple application instances can safely share the queue. Exactly-once external side effects still depend on the provider honoring the idempotency key; production provider integration must verify that contract and add operational dead-letter alerting.
