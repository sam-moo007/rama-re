# ADR 0004: Fail-closed secure artifact landing

- Status: Accepted
- Date: 18 July 2026

## Context

Partner files are untrusted binary inputs. A valid checksum proves only that RAMA received the declared bytes; it does not establish that those bytes are safe. Directly parsing or retaining them in the canonical ingestion path without malware isolation creates an avoidable operational and security risk.

## Decision

Partner bytes must pass the artifact-security boundary after exact byte-count/SHA-256 validation and before CSV rows enter raw ingestion. The boundary has independent malware-scanner and object-store ports.

Development uses an explicit volatile store and an EICAR-aware deterministic scanner so tests remain repeatable. Production defaults to ClamAV INSTREAM and an S3-compatible adapter. Production refuses the development adapters, requires separate clean and quarantine buckets, conditionally creates objects with `If-None-Match: *`, records checksum/source/scan metadata, tags the verdict, and requests SSE-S3 encryption.

A clean verdict permits partner parsing and database landing. A malicious verdict is written to the quarantine bucket, returns HTTP 422 and creates no raw rows. Scanner/storage errors fail the request. Reusing an object key for different bytes is an immutability conflict. Evidence leads may list security metadata, but the audit endpoint never returns object bytes.

## Consequences

- Malware cannot enter row transformation or entity resolution through the partner adapter.
- Quarantine access can be governed separately from normal evidence operations.
- Exact object replays are idempotent; overwrites are rejected.
- Object storage and PostgreSQL cannot share one transaction. A storage-success/database-failure can leave an orphan that a reconciliation job must detect.
- S3 bucket versioning, Object Lock/retention, key policy, lifecycle, access logging and quarantine incident handling remain infrastructure controls and release gates.
- Local deterministic scanning is not an antivirus claim and is forbidden in production.
