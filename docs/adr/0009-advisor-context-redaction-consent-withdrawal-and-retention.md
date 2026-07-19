# ADR 0009: Advisor context redaction, consent withdrawal and retention

Date: 18 July 2026

Status: Accepted

## Context

The first advisor workflow hid customer identifiers in the interface but returned the complete decision-case object to advisor browser code. That object contained the customer subject, advisor subject and audit actor identifiers. A case also referenced a brief version without retaining a privacy-minimized historical projection, so later consent changes could make the exact advisor context unrecoverable. Optional consent must be withdrawable and retention must be enforced rather than merely displayed.

## Decision

- Advisor queue and mutation transports use a dedicated redacted schema. They exclude owner subject, advisor subject, the internal context snapshot and all audit actor identifiers.
- Case creation stores an immutable `rama.advisor-context.v1` projection. It contains purpose, timeframe, price ceiling, financing flag, property constraints, communities, priorities, access needs and readiness classification. It excludes household composition, exact available cash, comfortable payment, consent fields and contact data.
- Advisors retrieve this projection through a separate context endpoint. Every queue read, context read, claim and close re-checks the current submitted brief and advisor-contact consent.
- Withdrawal first versions the customer's optional consent to false, preserving submitted status. It then retries cancellation of the active case. Because advisor access checks the brief independently, access fails closed even if cancellation propagation encounters a transient optimistic conflict.
- A retention worker runs on startup and every configured interval. It removes expired cases and events in bounded batches after their declared 180-day period.
- Decision-case events remain append-only during retention. Migration `0009` permits deletion only when the repository transaction sets the local retention-purge context, then removes events and their case together so no brief, shortlist or subject linkage survives.

## Consequences

The advisor browser receives task-relevant decision context without customer or staff identity keys and cannot use a stale queue entry after consent withdrawal. Historical case-time context remains deterministic until policy expiry, after which the linkage is erased. The consent update and case cancellation span separate repositories; the design therefore uses a fail-closed authorization check plus retry rather than claiming cross-repository atomicity. A future shared unit-of-work or outbox can add atomic propagation without changing the browser contract.
