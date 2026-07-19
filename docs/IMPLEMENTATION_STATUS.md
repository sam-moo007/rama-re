# RAMA implementation status

Updated: 18 July 2026

## Delivered increments

### Foundation

- pnpm workspace with Next.js web, NestJS/Fastify API and shared Zod contracts
- PostGIS/Redis local infrastructure definition
- CI-ready test, typecheck, lint and production-build commands
- shadcn/ui `base-lyra` preset foundation with RAMA brand-token and RTL integration
- modular-monolith and claim-provenance architecture decisions

### Customer decision room

- English and Arabic/RTL experience
- fit summary, Trust Passport, facts, accessible tour, deterministic costs, building/area, unknowns and advisor continuation
- desktop and mobile responsive verification

### Household brief and readiness

- bilingual four-step shadcn customer journey for household, budget, property-fit and consent constraints
- structured-field policy that avoids names, medical narratives and general sensitive free text
- required processing consent plus independent advisor-contact and de-identified-analytics choices
- customer-owned create, read, update and submit API with cross-customer existence protection
- optimistic concurrency, versioned create/update/submit events and an append-only Postgres audit trigger
- server-owned deterministic readiness with versioned assumptions and bilingual non-advice disclaimer
- cash-ready, cash-gap and financing-review classifications with explicit blockers
- in-memory development and transactional Postgres repository implementations
- same-origin customer BFF with allowlisted routes, mutation-origin validation and body limit
- production customer token read only from an HTTP-only `__Host-` cookie on the server
- submitted-state lock pending a later explicit amendment workflow

### Discovery, shortlist and comparison

- authenticated bilingual discovery route driven by the latest customer brief
- canonical catalogue/search projection contract with curated versus explicitly synthetic records
- deterministic, versioned ranking with inspectable hard-constraint, preference, unavailable-evidence and assumption signals
- unknown-preserving bedroom filtering so unavailable evidence cannot become false absence
- evidence coverage/freshness/community/price/tenure facets and deterministic sorting
- visible media-representation, freshness, missing-critical-evidence and decision-room-availability states
- customer-owned shortlist with canonical-slug validation, optimistic concurrency and one append-only audit event per version
- server-refreshed 2–4 property comparison with differing and unknown fields shown first
- in-memory development plus PostgreSQL catalogue-projection and shortlist repository adapters
- same-origin customer BFF allowlist for search, compare and shortlist operations
- property and household-workspace navigation into discovery
- evidence-labelled geo points and travel estimates with method, version, source, dates and assumptions
- explicit present, committed and modelled infrastructure states with match credit limited to present evidence
- unknown-preserving travel-time and map-bounds filters
- HMAC-signed, query/brief-bound cursor pagination with production secret enforcement
- PostGIS geography synchronization plus GiST and mobility JSONB indexes
- bilingual shadcn mobility filters, route evidence cards and forward/back result navigation
- deterministic batched canonical export into a rebuildable search-index port
- strict OpenSearch mapping with Arabic normalization/stemming, English analysis, geo points and nested mobility
- generation/fingerprint bulk reconciliation that deletes stale documents only after every batch succeeds
- fail-closed production OpenSearch HTTPS/API-key configuration with no in-memory fallback
- bounded production reconciliation worker plus analyst status and lead-only rebuild endpoints
- same-origin operations BFF allowlist for index status/reconciliation
- native OpenSearch PIT/search-after candidate traversal with partial-snapshot rejection and guaranteed cleanup attempt
- bounded candidate cap with fail-closed 503 behavior instead of an implicit PostgreSQL fallback
- canonical batch hydration, final API-owned evidence filtering/ranking and fingerprint drift detection
- atomic versioned-index read-alias promotion only after a complete successful reconciliation
- aggregate staff telemetry for candidate count, hydration, PIT pages, latency, stale identities, fingerprint drift and duplicates
- clean isolated Next.js development manifests on each workspace start so a preceding production build cannot leave locale routes returning stale 404s

### Consented advisor handoff

- explicit optional advisor-contact amendment that preserves submitted brief state and appends a versioned audit event
- customer handoff restricted to the owned current brief, shortlist version and one to four shortlisted properties
- structured reason, contact channel and topics without raw sensitive free text or browser-visible contact details
- exact four-hour response SLA, 180-day retention policy and requested/claimed/closed versioned audit history
- customer cancellation and repeat-handoff state transition after cancellation or closure
- advisor queue showing only unassigned requests and cases assigned to the current advisor
- self-claim and assigned-advisor-only closure with optimistic concurrency
- in-memory development and transactional PostgreSQL case repositories plus append-only event migration
- separate allowlisted customer and advisor BFFs with separate production HTTP-only cookies
- bilingual shadcn customer and advisor routes with repeatable Chrome/axe workflow audit
- dedicated redacted advisor transport that excludes customer/advisor subjects and audit actor identifiers
- immutable minimized advisor-context snapshot with exact brief version and no household composition, exact cash, payment or contact data
- consent withdrawal that preserves submitted status, cancels active work and blocks queue/context/claim/close access immediately
- bounded startup/interval retention worker that purges case and audit linkage after the declared 180-day policy
- privacy-lifecycle migration retaining append-only audit protection until an authorized expiry purge transaction

### Protected communications

- customer-owned contact profiles isolated from decision cases and advisor transports
- AES-256-GCM contact encryption with production key validation and masked-only public responses
- HMAC-protected, expiring and rate-limited email/SMS verification challenges with bounded attempts
- versioned notification preferences with required in-app updates and verified-channel enforcement
- fixed advisor message templates with current consent, case-version and assignment checks on every send
- auditable external delivery, in-app fallback and failure outcomes without revealing the delivery target
- signed HTTPS production webhook adapter with customer-specific idempotency keys and fail-closed configuration
- atomic notification/outbox enqueue before any external provider side effect
- lease-based bounded job claiming with stale-claim recovery for horizontally scaled workers
- five-attempt exponential retry, stable provider idempotency and terminal fallback/dead-letter settlement
- delivery-time consent, assignment, case-version, preference and verification rechecks
- owner-scoped notification inbox and read state with decision-case retention linkage
- in-memory development and transactional PostgreSQL repositories plus append-only contact event migration
- bilingual shadcn contact, verification, preference, advisor-message and inbox experiences

### Evidence operations

- shared workflow commands and response schemas
- repository interface with transactional Postgres and explicit in-memory development implementations
- queue and individual work-item endpoints
- review, publish, expire, correction and supersession commands
- optimistic concurrency and append-only audit events
- role boundary between evidence analysts and evidence leads
- bilingual desktop/mobile operations console
- Postgres migrations for work-item, complete bilingual claim-contract and audit-event persistence
- database-level optimistic concurrency with exactly one append-only audit event per saved version
- Postgres repository contract tests using an isolated in-process database

### Trusted ingestion

- shared manual-ingestion, artifact, source-entitlement and raw-record contracts
- approved manual adapter with staff role boundaries and bounded JSON payloads
- canonical JSON SHA-256 plus independent artifact checksum
- exact replay idempotency and duplicate artifact detection
- conflicting extraction quarantine without destructive overwrite
- source evidence-class allowlist and audited disable/enable kill switch
- in-memory development and transactional Postgres repository implementations
- immutable Postgres raw-record and source-event triggers
- strict `rama.partner.csv.v1` adapter with UTF-8, header, checksum, row and schema validation
- atomic immutable partner batch, raw-row association and exact-byte persistence
- entity-resolution queue with pending/conflict/matched/rejected states and append-only audit
- canonical-property validation and optimistic concurrency for resolution decisions
- enriched resolution work items carrying the immutable raw record, payload and artifact checksums
- bilingual shadcn entity-resolution console with filters, canonical matching, conflict/reject actions and audit history
- deterministic development partner fixtures for pending and quarantined-conflict operator states
- immutable artifact-storage port with in-memory development and S3-compatible production adapters
- EICAR-aware deterministic development scanner and ClamAV INSTREAM production adapter
- clean/quarantine bucket separation, conditional object creation, SSE-S3 and lead-only artifact audit endpoint
- partner intake blocked before row landing on malware, scanner failure or immutable-key conflict

### Identity and access

- verifier port separating development identity from production OIDC
- production default refuses development headers and requires a bearer token
- native RS256/JWKS signature verification with fixed trusted URL, key rotation retry and bounded cache
- issuer, audience, subject, expiry, not-before, issued-at and maximum-token-age validation
- exactly one trusted RAMA role per token, staff MFA enforcement and partner organization claim
- Nest controller boundary retains endpoint RBAC after authentication
- same-origin Next.js operations BFF with a strict route allowlist, mutation-origin check and body limit
- production operations token read only from an HTTP-only `__Host-` cookie on the server
- customer role with the same fail-closed OIDC validation and a separate customer-session cookie boundary

## Verification snapshot

- automated tests: 141 (contracts 24, API 114, web 3)
- browser routes checked: property decision room, household brief, discovery/compare, customer/advisor handoff, evidence operations and entity resolution in English/Arabic plus mobile RTL
- browser workflows checked: In review → Approved → Published, entity Pending → Matched, household draft → readiness → submitted, discover → shortlist → compare and advisor request → claim → close
- entity-resolution, household-brief, discovery/compare, advisor-handoff and communications axe scans: zero WCAG A/AA violations in the tested 2.0/2.1/2.2 rules
- keyboard checks: logical focus order and visible 3px focus indicator on all sampled controls
- authorization checked: evidence analyst publication and source approval boundaries receive HTTP 403
- household authorization checked: missing identity receives 401, advisor role receives 403 and cross-customer ownership is covered by API tests
- customer BFF checked: mutation without origin receives 403; browser save exposes no bearer, user or role headers
- discovery checked: 2+ bedrooms retains unknown-bedroom evidence, shortlist versions persist and comparison refreshes server-side
- advisor handoff checked: explicit consent amendment, exact four-hour SLA/180-day retention, isolated queue ownership and browser-header secrecy
- privacy lifecycle checked: redacted/minimized advisor payloads, withdrawal-driven queue removal, stale-context 404 and bounded retention purge
- protected communications checked: encrypted/masked contact lifecycle, verified email delivery, durable enqueue, provider retry/idempotency, in-app fallback, owner isolation, fixed templates and safe delivery audit
- geo discovery checked: unique cursor traversal, tamper/cross-query rejection, unknown-preserving travel/bounds filters, explicit synthetic labelling and no invented curated mobility claims
- search projection checked: Arabic/English/geo/nested mapping, successful generation cleanup, no cleanup after bulk failure, canonical rebuild, production configuration and lead-only reconciliation
- search reads checked: native PIT/search-after traversal and cleanup, partial-snapshot rejection, candidate cap, canonical hydration ordering, no-fallback 503, drift counters and atomic alias promotion
- clean restart checked after production build: API health plus English and Arabic discovery return HTTP 200 from one workspace runner
- horizontal overflow: none at 1440px or 390px verification widths

## Active constraint

Docker Desktop is installed but its engine is not running in this environment. The Postgres adapter is implemented and contract-tested against an isolated PostgreSQL-compatible database; migration and rollback smoke tests against the real PostGIS image remain pending until the engine is available. The running development workspace intentionally selects the in-memory repository.

The S3-compatible and ClamAV adapters are implemented and fail closed by default in production, but this environment has no running object-storage/ClamAV services. Development smoke tests therefore use the explicit in-memory store and deterministic EICAR scanner. Real bucket versioning/Object Lock, quarantine access policy and ClamAV availability checks remain deployment gates.

The communications boundary refuses its development provider in production. A real signed HTTPS delivery endpoint, provider credentials, idempotency certification, dead-letter alerting and provider reconciliation remain deployment gates; local workflow verification uses the explicit recording adapter.

The OpenSearch adapter, reconciliation worker, native PIT reads, canonical hydration, alias promotion and drift telemetry are implemented and fail closed in production, but no residency-reviewed OpenSearch cluster is available in this environment. Development uses the explicit in-memory index and canonical repository read source. Live mapping installation, PIT/alias security permissions, cluster alerting and load/failure testing remain deployment gates.

## Next execution order

1. Start Docker/Postgres and run migration/rollback plus adapter smoke tests against PostGIS.
2. Run S3/MinIO and ClamAV integration smoke tests; enforce bucket versioning/Object Lock and orphan reconciliation.
3. Integrate the selected OIDC gateway/login callback, central auth audit events and partner-source relationship policies.
4. Integrate production email/SMS providers, certify idempotency and add dead-letter alerting/reconciliation.
5. Connect a residency-approved OpenSearch cluster, run mapping/PIT/alias/load/failure smoke tests and alert on reconciliation/read drift; integrate a residency-approved live map/routing adapter.
6. Add Storybook and visual regression; run the existing axe route audit in CI.
7. Add derivative/capture chain-of-custody jobs and inventory freshness degradation.
