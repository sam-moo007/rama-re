# ADR 0008: Consented advisor handoff and case ownership

Date: 18 July 2026

Status: Accepted

## Context

Comparison must lead to an accountable human next step without silently exposing a customer's full household profile. Advisor contact is optional consent, submitted briefs are versioned records, and a case must retain the exact decision inputs an advisor was asked to review. Customer and advisor sessions also require separate least-privilege browser boundaries.

## Decision

- A customer may create a handoff only from an owned, submitted brief whose advisor-contact consent is true and the current owned shortlist version.
- The customer chooses one to four shortlisted properties plus a structured reason, contact channel and one to five topics. The case stores references and exact versions, not raw sensitive free text or contact details.
- Enabling advisor contact during handoff is an explicit, optimistic consent amendment. It adds one `consent_updated` audit event and does not reopen or otherwise mutate the submitted brief.
- A requested case has an exact four-hour response deadline, 180-day metadata retention and policy identifier `rama.customer-handoff.phase1.v1`.
- Advisors see unassigned requested cases and cases assigned to their own subject only. Assignment is self-claim; only the assigned advisor can close a case. Customer, advisor and ownership boundaries fail closed.
- Customer and advisor browsers use separate same-origin allowlisted BFFs and separate production HTTP-only `__Host-` cookies. Browser JavaScript never receives RAMA identity headers or bearer tokens.
- Case and event persistence is transactional with optimistic versions, a single event per saved version, a partial uniqueness constraint for one active customer case and an append-only event trigger. Production defaults to PostgreSQL and refuses volatile case persistence.

## Consequences

The workflow is auditable from consent through closure and avoids sharing more household data than the advisor task requires. Advisors cannot browse other advisors' assigned cases, and stale clients cannot overwrite a state transition. Contact-profile retrieval, consent withdrawal propagation, deletion/anonymization jobs and external CRM delivery remain later privacy and operations increments.
