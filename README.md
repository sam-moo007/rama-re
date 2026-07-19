# RAMA Real-Estate

[![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/sam-moo007/rama-re?utm_source=oss&utm_medium=github&utm_campaign=sam-moo007%2Frama-re&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)](https://coderabbit.ai)

RAMA is an evidence-led Dubai residential real-estate application. The first build increment proves the most important architectural promise: a property claim can move from a validated shared contract to an API and into an inspectable, bilingual customer decision room without losing source class, method, freshness, uncertainty, or correction context.

This repository is an implementation of the strategy in [RAMA_BUILD_PLAN.md](./RAMA_BUILD_PLAN.md). It is not yet a licensed public real-estate service and none of the sample financial, property, or evidence data should be treated as legal, valuation, mortgage, tax, or investment advice.

## What works now

- English and Arabic/RTL property decision room
- shadcn/ui `base-lyra` component system using preset `b2czZ8JLSS`, adapted to RAMA brand tokens
- Exact-unit media state and capture date
- Constraint-based fit summary and visible unresolved constraint
- Six-claim Trust Passport with an inspectable evidence drawer
- Claim-level source class, method, observed/retrieved/expiry dates, confidence, artifact and correction action
- Accessible Tier 0/Tier 1 tour concept with keyboard-operable room navigation and transcript alternative
- Four-stage cost waterfall and deterministic base/±1% mortgage scenario calculation
- Building/area evidence, risks/unknowns, and advisor handoff context
- NestJS/Fastify API for canonical property records
- Bilingual evidence-operations console with queue filters and audit history
- Review, approve, publish, expire, correction and supersession workflows
- Optimistic concurrency so stale operator screens cannot overwrite evidence
- Controlled manual ingestion through approved, entitled sources
- Immutable raw envelopes with canonical payload hashes, artifact checksums and source-scoped idempotency
- Source kill switch with append-only enable/disable audit and checksum-conflict quarantine
- Versioned partner CSV adapter with atomic batch landing and exact-byte retention
- Fail-closed artifact security with immutable S3-compatible storage, clean/quarantine buckets and ClamAV production scanning
- Entity-resolution queue with canonical-property validation and versioned decisions
- Bilingual entity-resolution operations console with raw-record, checksum, payload and audit inspection
- Fail-closed OIDC bearer verification with fixed issuer/audience/JWKS, short token age, staff MFA and strict RAMA role claims
- Same-origin operations BFF that keeps production access tokens in HTTP-only cookies and removes identity headers from browser JavaScript
- Bilingual guided household brief using shadcn controls for household, budget, property-fit, access and consent constraints
- Customer-owned versioned brief API with optimistic concurrency, append-only audit events and submitted-state locking
- Server-calculated cash/financing readiness with explicit versioned assumptions and bilingual non-advice language
- Same-origin customer BFF that keeps the customer token in a separate HTTP-only cookie and exposes no browser identity headers
- Brief-aware bilingual discovery with explicit match/review/unknown signals and unknown-preserving filters
- Versioned customer shortlist and differences-first 2–4 property comparison
- Evidence-labelled mobility discovery with present/committed/modelled states, unknown-preserving travel and map-bounds filters
- Signed query-bound cursor pagination and PostGIS-ready geo/mobility projection indexes
- Rebuildable OpenSearch projection with Arabic/English analyzers, geo/nested mobility mapping and generation-safe reconciliation
- Bounded OpenSearch PIT/search-after candidate reads with atomic read aliases, canonical PostgreSQL hydration and drift telemetry
- PostgreSQL catalogue search projection and shortlist persistence with an explicit in-memory development adapter
- Explicit consent amendment and protected customer-to-advisor handoff with exact source versions, four-hour SLA and 180-day retention
- Bilingual advisor case queue with least-privilege self-claim, assigned-advisor closure and append-only audit history
- Separate customer/advisor same-origin BFFs and production HTTP-only session-cookie boundaries
- Redacted advisor transports and immutable minimized context snapshots with fail-closed consent rechecks
- Customer consent withdrawal with active-case cancellation and automated 180-day retention purge
- Encrypted customer contact profiles with masked-only responses, expiring email/SMS verification and versioned notification preferences
- Fixed-template advisor updates with consent rechecks, verified-channel delivery, in-app fallback and a private delivery-audit inbox
- Transactional notification outbox with leased workers, stable idempotency, exponential retry and dead-letter/fallback settlement
- Zod contracts shared by the web and API applications
- PostGIS-ready trust-core and evidence-operations migrations with bitemporal claim history
- Contract and API unit tests, TypeScript checks, ESLint and production builds

## Workspace

```text
apps/
  api/       NestJS + Fastify modular application core
  web/       Next.js App Router customer experience
packages/
  contracts/ Shared Zod domain contracts and Phase 0 fixture
infra/
  database/  PostGIS migrations
docs/
  adr/       Architecture decisions
```

## Requirements

- Node.js 22 or later
- pnpm 11
- Docker Desktop only if running Postgres/Redis locally

## Start locally

```powershell
Copy-Item .env.example .env
pnpm install
pnpm dev
```

`pnpm dev` checks ports 3000 and 4000 before starting. If a RAMA stack is already running, it exits before spawning duplicate watchers; stop the existing stack before starting another.
The web package also clears only Next.js's isolated `.next/dev` manifest before startup, preventing stale development routes after a production build while retaining the production `.next` output.

Customer routes:

- <http://localhost:3000/en/properties/residence-1204>
- <http://localhost:3000/ar/properties/residence-1204>
- <http://localhost:3000/en/brief>
- <http://localhost:3000/ar/brief>
- <http://localhost:3000/en/discover>
- <http://localhost:3000/ar/discover>
- <http://localhost:3000/en/advisor>
- <http://localhost:3000/ar/advisor>
- <http://localhost:3000/en/settings/contact>
- <http://localhost:3000/ar/settings/contact>
- <http://localhost:3000/en/notifications>
- <http://localhost:3000/ar/notifications>
- <http://localhost:3000/en/advisor/cases>
- <http://localhost:3000/ar/advisor/cases>
- <http://localhost:3000/en/operations/evidence>
- <http://localhost:3000/ar/operations/evidence>
- <http://localhost:3000/en/operations/resolution>
- <http://localhost:3000/ar/operations/resolution>

API routes:

- <http://localhost:4000/api/v1/health>
- <http://localhost:4000/api/v1/properties/residence-1204>
- <http://localhost:4000/api/v1/evidence/queue>
- <http://localhost:4000/api/v1/ingestion/sources>
- <http://localhost:4000/api/v1/ingestion/records>
- <http://localhost:4000/api/v1/ingestion/resolution-queue>
- <http://localhost:4000/api/v1/ingestion/artifacts>
- <http://localhost:4000/api/v1/briefs/mine>
- <http://localhost:4000/api/v1/properties/search>
- <http://localhost:4000/api/v1/shortlists/mine>
- <http://localhost:4000/api/v1/decision-cases/mine>
- <http://localhost:4000/api/v1/advisor/cases/queue>
- <http://localhost:4000/api/v1/contact-profile/mine>
- <http://localhost:4000/api/v1/notifications/mine>

Development mode requires explicit `x-rama-user` and `x-rama-role` headers on protected API requests. Production defaults to OIDC and refuses the development verifier entirely. It accepts only RS256 bearer tokens signed by the configured JWKS, with matching issuer/audience, bounded age, one trusted RAMA role and MFA for staff roles. Partner tokens also require an organization claim.

The browser consoles call the same-origin `/api/operations/*` BFF. In production the BFF reads `__Host-rama-operations-token` from an HTTP-only cookie, validates request origin for mutations and forwards only allowlisted operations routes. The external OIDC gateway/login callback that issues this cookie remains a deployment integration; tokens are never read from browser JavaScript or stored in local storage.

The household journey uses the separate same-origin `/api/customer/*` BFF and `__Host-rama-customer-token` production cookie. Readiness is calculated by the API—not the browser—and every stored result includes its assumption version and disclaimer. Local development uses an explicit `dev-customer-01` customer identity inside the server-side BFF only.

Optional infrastructure:

```powershell
docker compose up -d postgres redis
```

To exercise durable evidence operations locally after Postgres becomes healthy, set these values in `.env` and restart `pnpm dev`:

```dotenv
EVIDENCE_REPOSITORY=postgres
EVIDENCE_SEED_FIXTURES=true
INGESTION_REPOSITORY=postgres
INGESTION_SEED_FIXTURES=true
DATABASE_SSL_MODE=disable
```

Secure artifact processing uses explicit adapters. Development defaults to volatile object storage plus an EICAR-aware deterministic scanner. Production defaults to S3 and ClamAV, refuses volatile storage or the deterministic scanner, requires different clean/quarantine buckets, uses conditional object creation to block overwrite, and encrypts new S3 objects with SSE-S3. Configure `ARTIFACT_STORE`, `MALWARE_SCANNER`, `OBJECT_STORAGE_*` and `CLAMAV_*` from `.env.example`.

Production defaults to the Postgres repository, refuses an unencrypted database connection, and never permits fixture seeding. Development defaults explicitly to the volatile in-memory repository so the UI remains runnable without Docker.

## Verification

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm --filter @rama/web audit:advisor
pnpm --filter @rama/web audit:communications
pnpm --filter @rama/web audit:discovery-geo
```

## Web component standard

Interactive controls in `apps/web` use the configured shadcn/ui primitives. The preset is recorded in `apps/web/components.json`; add new primitives from the repository root with:

```powershell
pnpm dlx shadcn@latest add <component> -c apps/web
```

RAMA color tokens remain the product source of truth. shadcn semantic tokens in `apps/web/src/app/globals.css` map the preset onto the limestone, ink, sage and copper brand palette and retain RTL support.

The verified browser matrix includes the customer property, household-brief and discovery/compare routes, evidence operations and entity resolution at 1440px English, Arabic/RTL, and 390px mobile. All return HTTP 200 and have no document-level horizontal overflow. Evidence operations has been exercised through In review → Approved → Published; entity resolution through Pending → Matched; a household brief through consent, server readiness and submission; and discovery through unknown-preserving filter, shortlist and comparison. These customer/operations routes have zero automated axe violations against the tested WCAG 2.0/2.1/2.2 A/AA rule set.

## Architectural boundaries

- `@rama/contracts` owns transport/domain shapes, but not persistence or UI.
- `apps/api` owns application modules and repository adapters; controllers remain thin.
- `apps/web` owns presentation and localized interaction. It never computes evidence status independently.
- PostgreSQL is canonical truth. Redis will hold ephemeral state only.
- External source schemas terminate at adapters and never leak into claim entities.
- Evidence coverage measures claim availability. It is not property quality, legal status, certification, or investment merit.
- Evidence workflow commands use optimistic versions and append one audit transition per version.
- Evidence operations use a transactional Postgres adapter in durable environments and an explicit in-memory fallback in local development. Every save performs an atomic version check and appends exactly one audit event.
- Raw ingestion never publishes claims directly. It lands a checksummed immutable envelope; conflicting extraction is quarantined for entity resolution and review.
- Ingestion sources require an entitlement reference and evidence-class allowlist. The source kill switch blocks new landing records atomically without deleting history.
- Partner files use the documented `rama.partner.csv.v1` contract. File bytes, row landing, batch associations and entity-resolution work commit atomically.
- Partner bytes pass checksum validation, malware inspection and immutable clean/quarantine object landing before CSV rows can enter raw ingestion. Evidence leads can audit artifact metadata without receiving object bytes.
- Protected API authorization is server-enforced after authentication. Development headers are isolated to non-production mode; OIDC mode ignores them and enforces signed identity plus endpoint roles.
- Household inputs are customer-owned and versioned. The API is the only readiness authority; the web application renders returned assumptions and never independently classifies readiness.
- Discovery uses OpenSearch only for bounded candidate identities in production, then batch-hydrates canonical PostgreSQL records. Fit and comparison signals remain API-owned, versioned and preserve unavailable evidence instead of converting it to a negative.
- Shortlists are customer-owned, canonical-slug constrained and optimistically versioned with one append-only audit event per save.
- Contact values are encrypted outside decision cases. Advisor browsers receive only template and delivery outcome metadata; the server alone resolves verified delivery targets.
- Travel-time filtering excludes known contradictions while retaining missing route/location evidence; synthetic routes are visibly labelled and never attached to curated records.
- OpenSearch is a rebuildable discovery projection only: canonical records are exported in deterministic batches and stale index documents are removed only after a complete successful generation.
- OpenSearch candidate reads use a native point-in-time snapshot and `search_after`; the versioned physical index is exposed through an atomic read alias only after successful reconciliation. Index failure returns 503 and never triggers an implicit unbounded repository scan.

## Next increments

1. Run the Postgres adapter against Docker and add migration/rollback smoke tests.
2. Smoke-test S3/MinIO and ClamAV adapters, enforce bucket versioning/Object Lock in infrastructure, and add orphan reconciliation.
3. Integrate the selected OIDC gateway/login callback, add centralized authentication audit events, and bind partner organizations to entitled sources.
4. Integrate production email/SMS providers, certify idempotency and add dead-letter alerting/reconciliation.
5. Connect a residency-approved OpenSearch cluster, run mapping/PIT/alias/load/failure smoke tests and alert on reconciliation/read drift; integrate a residency-approved live map/routing adapter.
6. Establish Storybook and visual regression; promote the current axe browser audit into CI.
7. Add derivative/capture chain-of-custody jobs and inventory freshness degradation.

Source entitlement, licensing, fee rules, mortgage rules, residency and regulated-language review remain Phase 0 gates and must not be inferred from this prototype.
