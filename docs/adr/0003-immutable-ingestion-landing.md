# ADR 0003: Immutable raw ingestion landing

- Status: Accepted
- Date: 18 July 2026

## Context

RAMA must accept manually entered and partner-provided evidence without allowing source payloads to mutate canonical claims directly. Replays must be safe, source entitlement must be revocable, and conflicting extraction must remain inspectable.

## Decision

Every adapter writes a source-scoped raw ingestion envelope before transformation or entity resolution. The envelope stores canonical JSON, its SHA-256, the independent artifact checksum, schema version, retrieval time, submitter, property/claim hints and adapter identity.

Raw records and source-control events are append-only at the database layer. A source requires an entitlement reference and evidence-class allowlist. Disabling it locks the source row and prevents new envelopes atomically; historical records are retained. Source-scoped idempotency keys replay the original result. Matching artifact and payload checksums are treated as duplicates, while conflicting payloads for the same artifact enter quarantine.

Raw ingestion never publishes or updates a customer-visible claim. Transformation, entity resolution and evidence review remain separate controlled stages.

Approved partner CSV files are retained as exact immutable bytes in a batch record. The file, all raw rows, batch-to-row associations and initial entity-resolution work commit in one transaction. A resolution can only enter `matched` when its target exists in RAMA's canonical property catalogue.

## Consequences

- Evidence can be replayed and audited without depending on mutable partner state.
- Source revocation stops new ingestion without erasing provenance.
- Conflicts become explicit work rather than last-write-wins corruption.
- Storage grows monotonically and requires a governed retention/archival policy.
- Partner bytes now pass through the separately governed artifact-security boundary described in ADR 0004 before database landing.
- Bounded partner bytes remain in the immutable Postgres batch record for transactional replay while an independent encrypted object copy provides quarantine separation and future retention/lifecycle controls.
