# RAMA Real-Estate — Comprehensive Build Plan

## 1. Product goal

Build and launch a bilingual, trust-first Dubai residential real-estate application that lets a customer move from a constraint-based brief to a documented next step using evidence-complete properties, inspectable Trust Passports, accessible immersive tours, deterministic cost scenarios, and a continuous decision record.

### Goal completion criteria

The initial goal is achieved when a controlled concierge MVP can safely serve real users and all of the following are true:

1. 150–300 active properties across 6–8 Dubai communities meet at least 90% critical-evidence coverage.
2. Users can complete the first-time-buyer path: brief → readiness → shortlist → property decision room → tour/viewing → documented next step.
3. Every material claim exposes class, source, method, dates, scope, confidence, and freshness; stale evidence degrades visibly.
4. Costs are deterministic, versioned, effective-dated, and reviewed before a transaction action.
5. Arabic and English core journeys meet WCAG 2.2 AA and work without panorama, 3D, or XR.
6. Advisor, evidence, correction, and viewing SLAs are observable and recoverable.
7. Security/privacy controls pass release review and an independent test appropriate to the launched scope.
8. Pilot metrics demonstrate evidence-state comprehension, useful-tour completion, qualified-viewing improvement, and acceptable unit economics.

### Roadmap at a glance

| Phase | Timebox | Primary proof | Delivery unit | Gate |
| --- | --- | --- | --- | --- |
| 0 · Prove | Weeks 0–8 | Evidence can be sourced, understood, and operationally maintained | 6 parallel work packages | Viable entitlement, Passport comprehension, useful tour, plausible capture economics |
| 1 · Concierge MVP | Months 2–6 | A controlled bilingual journey works with 150–300 curated properties | 11 two-week sprints | ≥90% critical evidence coverage, viewing/SLA lift, security/accessibility readiness |
| 2 · Marketplace | Months 6–12 | Partner supply and off-plan workflows scale without trust decay | 6 cross-functional workstreams | Repeatable data quality, correction SLA, contractual entitlement, unit economics |
| 3 · Spatial lifecycle | Months 12–24 | Spatial and post-purchase features create measurable lifecycle value | 5 selective workstreams | Spatial utility, retention, governance maturity, expansion readiness |

## 2. Scope and sequencing

### MVP scope

- Dubai residential: ready ownership first, with a deliberately limited long-term-rental surface if operations can support it
- First-time resident buyer as the primary end-to-end journey
- Remote investor and accessibility needs built into the underlying evidence/media model
- Curated, manually approved inventory
- Guided brief, readiness, search, compare, Trust Passport, Tier 0/Tier 1 tour, cost engine v1, advisor/viewing workflow, corrections, bilingual core

### Explicitly deferred

- Broad inventory aggregation
- Commercial and holiday homes
- Tokenised ownership
- Automated transaction execution
- Native mobile apps before PWA evidence
- 3D district context, WebXR, advanced personalization, owner-care/resale automation, and geographic expansion

### Non-negotiable sequencing

Build the evidence model before broad search, the decision record before AI, Tier 0/Tier 1 tours before 3D/XR, and operational correction workflows before marketplace scale.

## 3. Delivery assumptions

- Initial squad: 12–16 people across product/domain, design/research, engineering, evidence operations, and customer operations.
- Planning cadence: two-week sprints; phases use outcome gates rather than feature-count gates.
- Architecture: TypeScript modular monolith with explicit domain boundaries; extraction to services only after an independent scale, ownership, or reliability case.
- Cloud: AWS UAE region, multi-AZ where service availability and residency review permit.
- DLD/API access is a dependency to validate, not an assumption. Manual approved evidence is the fallback for the pilot.
- Legal, tax, valuation, investment, licensing, fee, mortgage, eligibility, and data-residency rules require qualified review before launch.

## 4. Target architecture

### Experience layer

- Next.js App Router, React, TypeScript, server rendering, streaming, and PWA shell
- CSS variables and accessible headless primitives with a RAMA-owned component layer
- Storybook for bilingual, responsive, accessibility, evidence-state, and stale-state coverage
- Separate role-oriented surfaces using the same design system: customer web/PWA, advisor console, evidence-operations console, partner portal, capture workflow

### Application core

- NestJS on Fastify with OpenAPI
- Modules: identity/access, catalogue, evidence/trust, search, decision workspace, cost/scenario, tour/media, advisor/CRM, transaction/tasks, consent/privacy, notifications, audit
- Background work via SQS/EventBridge or region-compatible equivalents

### Data and media

- PostgreSQL + PostGIS as canonical truth
- Redis for ephemeral cache/session/job coordination only
- OpenSearch for Arabic/English keyword, facet, hybrid, and geospatial discovery
- Immutable S3-compatible originals, signed derivatives, CDN, image/tile workers
- Claim-level provenance and bitemporal history
- Consent-aware product analytics to warehouse/dbt, with no sensitive free text by default

### Integration boundary

- One adapter per source; external schemas never enter domain entities
- Raw immutable landing objects with checksum and schema version
- Idempotent ingestion, entity resolution, validation, human reconciliation queues, entitlement/cache policies, field lineage, and source kill switch
- Pluggable maps/routing, DLD/approved sources, mortgage/KYC, CRM/comms, payment, and tour-vendor adapters

## 5. Core domain model

The first schema increment must cover:

- `PropertyUnit`, `Building`, `Project`, `Community`
- `Listing`, `Provider`, `Broker`, `AdvertPermit`
- `Claim`, `EvidenceArtifact`, `Source`, `VerificationReview`, `Correction`
- `Tour`, `TourVersion`, `Scene`, `Plan`, `Hotspot`, `Measurement`, `MediaAsset`
- `User`, `HouseholdWorkspace`, `Brief`, `Criterion`, `Shortlist`, `Comparison`, `Scenario`, `Question`
- `DecisionRecord`, `Task`, `AdvisorHandoff`, `Viewing`, `OfferReadiness`
- `Consent`, `Purpose`, `Document`, `AuditEvent`

Every material `Claim` stores value/unit, source, source class, method, `observed_at`, `retrieved_at`, `valid_to`, confidence, verifier, approval state, linked artifact, and `supersedes`. Property-level completion is computed from required claim coverage and never interpreted as property quality.

## 6. Phase plan

## Phase 0 — Prove the operating model (weeks 0–8)

### Outcome

Demonstrate that RAMA can legally source and present critical evidence, that users understand the Trust Passport, and that a structured tour changes a real viewing decision.

### Work package 0.1 — Operating model and source entitlement (weeks 0–2)

- Choose licensed brokerage/referral/advisory boundaries and revenue disclosure model.
- Inventory DLD, Madmoun/Trakheesi, Dubai REST, Oqood/escrow, Ejari/Mollak, developer, broker, capture, map, mortgage, and communications dependencies.
- Record API/display/storage/cache/derivative rights, residency, rate limits, owners, fallback, and kill-switch requirements.
- Define manual-evidence pilot path where approved API access is unavailable.

Deliverables: operating-model decision record; source entitlement matrix; partnership outreach list; legal/compliance issues log.

Exit check: no planned MVP feature depends on undocumented entitlement.

### Work package 0.2 — Research and service blueprint (weeks 0–4)

- Recruit 30 participants spanning the priority need states, with Arabic and English coverage.
- Test evidence-state comprehension, first-time-buyer readiness, remote inspection, accessibility chain, privacy preferences, and advisor expectations.
- Map frontstage journey and backstage evidence/capture/correction/advisor work.
- Establish current baselines for wasted viewings, evidence requests, response time, and decision blockers.

Deliverables: research repository; jobs/needs map; service blueprint; baseline metrics; prioritized failure modes.

Exit check: users can explain registry/document/on-site/provider/modelled/unknown states in plain language.

### Work package 0.3 — Trust method and content governance (weeks 1–5)

- Define critical claims by property type and journey.
- Define evidence classes, confidence, freshness/expiry, review authority, dual review, corrections, challenges, and audit retention.
- Create Arabic/English regulated-term glossary and human-review thresholds.
- Define recommendation, sponsorship, AI, calculation, and no-false-authority policies.

Deliverables: Trust Passport schema v1; evidence playbook; content risk tiers; correction SLA; score/completion method.

Exit check: every displayed trust state has a reproducible method and named operational owner.

### Work package 0.4 — Tour capture pilot (weeks 2–6)

- Capture 10 exact units with written authority and privacy sweep.
- Produce originals, panoramas, ordered stills, plan alignment, captions/transcript, measurements, and annotations.
- Measure capture/processing/QA time, defects, recapture triggers, storage, device performance, and user utility.
- Validate vendor export rights and RAMA-owned annotations.

Deliverables: capture SOP; media contract; QA checklist; 10 evidence bundles; cost model.

Exit check: at least one tour materially changes a participant’s viewing/shortlist decision and all evidence has chain-of-custody metadata.

### Work package 0.5 — Bilingual clickable prototype (weeks 3–7)

- Design and test the guided brief, readiness summary, property decision room, Trust Passport details, cost waterfall, Tier 0/Tier 1 tour, compare room, and advisor handoff.
- Test desktop/mobile, RTL, keyboard, reduced motion, 200% zoom, low bandwidth, Arabic expansion, and grayscale hierarchy.
- Iterate copy and evidence anatomy, not just surface styling.

Deliverables: approved Superdesign flow; design-system v1; component inventory; usability report.

Exit check: evidence comprehension and task completion meet the thresholds set in week 1.

### Work package 0.6 — Architecture/security foundation (weeks 4–8)

- Create threat model, data-flow map, initial DPIA/processing register, data classification, retention draft, and vendor review template.
- Validate AWS UAE service availability and cross-border telemetry/support flows.
- Write architecture decision records for modular monolith, provenance, bitemporality, search, async, media, identity, and analytics.
- Build a vertical technical spike: one property → claims → review → API → bilingual property screen → audit trace.

Deliverables: threat model; DPIA draft; ADR set; deployment/service matrix; working evidence vertical slice.

### Phase 0 gate — 90-day decision

Proceed only if inventory authority is viable, critical evidence can be sourced, users understand the Passport, capture economics are plausible, and a tour changes a decision. Otherwise narrow the wedge or stop before marketplace investment.

## Phase 1 — Concierge MVP (months 2–6)

### Outcome

Launch a controlled bilingual service for 150–300 curated properties with staff-assisted operations and complete observability.

### Sprint 1 — Engineering bootstrap

- Monorepo, environments, IaC baseline, CI/CD, secret management, preview deployments, feature flags.
- Next.js shell, NestJS modules, Postgres/PostGIS, object storage, queue, OpenAPI generation.
- OIDC, staff MFA, roles/relationships, audit-event foundation.
- Test strategy, quality gates, OpenTelemetry, logs/traces/metrics, error reporting.

Acceptance: one-click non-production deploy; authenticated traced request; migrations/rollback tested; no secrets in repository.

### Sprint 2 — Canonical catalogue and evidence ledger

- Property/building/project/community/listing/provider models.
- Claim/artifact/source/review/correction/bitemporal schema.
- Evidence requirement templates and completion calculation.
- Evidence-operations create/review/publish UI and audit trail.

Acceptance: reviewers can publish, expire, supersede, correct, and explain every claim; aggregate score never masks missing critical evidence.

### Sprint 3 — Ingestion and media foundation

- Manual import and approved partner-file adapter.
- Raw immutable landing, checksum, validation, duplicate detection, entity-resolution queue.
- Signed upload, malware scan, EXIF removal, immutable originals, derivative jobs, takedown/kill switch.
- Inventory freshness scheduler and stale-state rules.

Acceptance: replay is idempotent; conflicts enter a work queue; source revocation removes derivatives predictably; stale UI state changes automatically.

### Sprint 4 — Bilingual design system and application shell

- Tokenized RAMA components in Storybook.
- Global nav, language/direction switch, typography/numerals/dates, responsive grids.
- Evidence badge, property card, Passport drawer, risk callout, compare tray, cost waterfall, form/error patterns.
- Automated accessibility checks plus manual keyboard/screen-reader/RTL review.

Acceptance: component matrix passes English/Arabic, mobile/desktop, stale/unknown/risk, 200% zoom, reduced motion, and grayscale tests.

### Sprint 5 — Guided brief and readiness

- Household workspace, consent, budget/timeframe/commute/access/tenure/non-negotiables.
- Indicative cash-to-close and LTV-boundary guidance with clear non-advice language.
- First-time-buyer programme checklist, document checklist, saved progress, advisor escalation.
- Avoid sensitive-attribute inference and sensitive URL parameters.

Acceptance: a user can save/edit/share the brief; recommendations distinguish hard constraint, preference, unavailable evidence, and assumption.

### Sprint 6 — Search, map, shortlist, compare

- OpenSearch indexing, Arabic/English analyzers, facets, keyword/geo search, evidence coverage filter, freshness filter.
- Map/routing adapter and present-vs-committed infrastructure labels.
- Shortlist and differences-first compare with missing data visible.
- Recommendation rationale and sponsored-lane separation.

Acceptance: results reconcile to canonical Postgres; ranking explanation is inspectable; unknowns cannot be filtered into false absence.

### Sprint 7 — Property decision room and Trust Passport

- Fixed information order from fit through advisor.
- Key facts, media labels, evidence completion, claim details, source dates, unknowns, corrections.
- Building/community evidence and comparable transaction context where entitled.
- Privacy-safe share room and comments.

Acceptance: every critical fact opens to provenance; stale and superseded evidence is obvious; page works with image placeholders and Tier 0 media.

### Sprint 8 — Tour v1

- Tier 0 SSR overview, still gallery, ordered room list, plan, captions/transcript, evidence drawer.
- Tier 1 lazy panorama, plan/scene synchronization, hotspots, saved viewpoint, question attachment.
- Capability detection, adaptive tiles, media budgets, keyboard/reduced-motion operation.
- Capture QA and publish workflow.

Acceptance: mid-range mobile remains stable; first panorama preview ≤500KB; critical evidence remains available without WebGL; accessibility QA passes.

### Sprint 9 — Cost engine v1

- Versioned effective-dated fee/rule catalogue.
- Buyer waterfall: reservation, transaction, ownership, exit.
- Rate/term, service charge, vacancy/rent range, FX display, hold-period scenarios.
- Deterministic API, calculation version, assumptions, citations, named content owner, pre-action refresh.

Acceptance: golden test cases and independent finance/domain review pass; UI distinguishes input, sourced fact, assumption, range, and output.

### Sprint 10 — Advisor, viewing, and operations

- Decision timeline, advisor assignment, SLA, questions, co-browse consent, viewing request/confirmation/outcome.
- Evidence request and correction workflows linked to affected shortlists.
- Notification preferences, protected contact, handoff recovery, operations dashboards.
- Product analytics for evidence open, qualified shortlist/viewing, useful tour completion, blockers, stale rate, corrections, SLA.

Acceptance: no customer task is orphaned; median critical correction path is measurable; analytics exclude raw sensitive text by default.

### Sprint 11 — Hardening and pilot release

- Load/performance/resilience, backup restore, queue replay, CDN/media fallback, WAF/rate limits.
- SAST/DAST/dependency/IaC scanning, privileged access review, incident/takedown/correction exercises.
- Full bilingual accessibility audit and independent penetration test scoped to launched features.
- Pilot runbook, training, support, rollback, status, and go/no-go review.

### Phase 1 gate

- ≥90% critical evidence coverage on active inventory
- Critical correction resolution trending below 48 hours
- Qualified-viewing lift and fewer avoidable visits versus pilot baseline
- Advisor/capture/evidence SLAs achieved
- No unlabeled sponsorship, critical accessibility blocker, high-severity security finding, or unsupported legal/financial rule

## Phase 2 — Marketplace and off-plan (months 6–12)

### Workstream 2.1 — Partner portal and feed adapters

- Partner identity/MFA, organization/relationship permissions, schema onboarding, evidence upload, validation feedback, freshness scorecards.
- Adapter SDK/contract tests, reconciliation queue, entitlement enforcement, source kill switch.

### Workstream 2.2 — Automated trust operations

- Evidence expiry events, re-verification reminders, affected-shortlist notifications, correction prioritization, provider quality dashboards.
- Sampling and dual review for high-risk evidence; immutable approval history.

### Workstream 2.3 — Off-plan chronology

- Permit/project registration, contractual/current/scenario dates, payment triggers, media representation labels, variation log, progress evidence, handover checklist.
- Store source clauses beside high-risk summaries and require reviewed-on metadata.

### Workstream 2.4 — Guided live tour

- Consent-based synchronized navigation, independent pause, advisor pointer, timestamp/viewpoint questions, reconnect/recovery, session audit.

### Workstream 2.5 — Secure document room and mortgage referral

- Relationship-based access, short sessions, malware scan, encryption, signed links, watermark, download audit, retention/legal hold.
- Referral disclosures and explicit handoff; do not turn indicative readiness into approval claims.

### Workstream 2.6 — Community scenario atlas

- Present vs committed vs modelled transport, peak-time commute, shade/walkability method, school-run and access-route evidence, source/method dates.

### Phase 2 gate

Partner data quality is repeatable, correction time stays within SLA, entitlement is contractually sound, unit economics are positive enough to scale, and off-plan summaries remain traceable to reviewed source clauses.

## Phase 3 — Spatial lifecycle (months 12–24)

### Workstream 3.1 — Selective 3D/XR

- glTF/GLB pipeline, mesh optimization, measurements, capability checks, explicit load, non-XR parity.
- WebXR only for validated utility; no roadmap credit for spectacle.

### Workstream 3.2 — Building and district context

- Cesium/3D Tiles only where city-scale context improves decisions; source/date/modelled labels for views, sun, construction, and infrastructure.

### Workstream 3.3 — Handover, snagging, and owner care

- Notice/payment/tasks, inspection/snag evidence, keys/utilities, warranties/defects, service charge and maintenance record.
- Ownership record becomes the basis for renewal, rental, resale, and recapture.

### Workstream 3.4 — Privacy-safe personalization and AI

- Consented preference memory; no inference of sensitive identity.
- Retrieval-only fact explanation with citations, bounded intents, deterministic tools, confidence, human escalation, and audit evaluation set.

### Workstream 3.5 — Evidence API/B2B and selective expansion

- Productized evidence/tour interfaces with explicit entitlement, versioning, audit, corrections, and rate limits.
- Expand geography only after local regulation, sources, Arabic/localization, operations, and governance gates are satisfied.

### Phase 3 gate

Spatial features prove measurable utility, lifecycle retention is real, privacy/security governance is mature, and expansion does not dilute evidence quality.

## 7. Cross-cutting workstreams

### Quality and testing

- Unit tests for rules, scores, freshness, permissions, and transformations
- Contract tests for every source/partner adapter
- Golden tests for deterministic calculators
- Integration tests for audit, async replay, expiry, consent withdrawal, source kill switch, and corrections
- End-to-end tests for bilingual critical journeys and role boundaries
- Visual regression across breakpoints, RTL, Arabic expansion, evidence states, and media fallbacks
- Accessibility tests: automated plus manual keyboard, screen reader, zoom, reduced motion, captions/transcript
- Performance tests for SSR, search, media tiles, mid-range mobile memory, queues, and CDN failure
- Security tests and threat-model review at design gates

### DevSecOps and reliability

- Trunk-based development with protected main, preview environments, progressive release, feature flags, and rollback
- Terraform, policy checks, encrypted state, separate accounts/environments, least privilege
- SLOs for customer page availability, search, evidence freshness jobs, tour availability, document access, and advisor tasks
- Runbooks for source compromise, stale inventory surge, media privacy incident, broker impersonation, correction, consent withdrawal, and regional outage
- Restore tests and tracked deletion through originals, derivatives, backups, and vendors

### Governance

- Weekly evidence-quality/stale-inventory review
- Biweekly product-discovery/accessibility review
- Monthly privacy/security/AI review
- Quarterly source-entitlement/vendor audit
- Per-release go/no-go with rollback owner
- Evidence approval remains independent from revenue/sales targets

## 8. Metrics and instrumentation

### North-star

Verified decisions completed: the customer reaches a documented next step with critical evidence reviewed, assumptions acknowledged, and no unresolved blocker hidden.

### Trust metrics

- Critical evidence coverage; stale rate; evidence-open rate; correction rate/time; source coverage; Passport comprehension; undisclosed-conflict incidents

### Decision metrics

- Brief completion; qualified shortlist; compare usage; useful-tour completion; question resolution; qualified viewing; avoidable viewing reduction; unresolved-blocker rate; offer readiness

### Operational metrics

- Capture cycle/cost/QA rejection; evidence review SLA; advisor response/handoff; ingestion conflicts; source failures; media/transcript coverage

### Business metrics

- Contribution margin per verified decision; partner retention; capture payback; referral/brokerage disclosure rate; lifecycle revenue

### Technical/accessibility metrics

- Core Web Vitals by device/locale; search latency; panorama preview size/time; job lag; error budget; WCAG defects; keyboard/tour alternative completion

## 9. Release gates and definition of done

No work package is done until:

- Product acceptance criteria and failure/empty/stale/unknown states are implemented.
- English and Arabic content/direction have been reviewed at the required risk tier.
- Keyboard, focus, zoom, reduced motion, screen-reader name/state, and low-bandwidth fallback are covered.
- Authorization, audit, privacy, retention, and analytics classifications are reviewed.
- Unit/integration/E2E or contract tests match the risk.
- Observability, alerts, runbook, rollback, and operational owner exist.
- Evidence/source/method/effective date are visible wherever the feature makes a claim.
- Documentation and ADRs are updated.

## 10. Highest-risk dependencies and mitigations

1. Source/API entitlement: prototype with approved manual evidence; cap inventory; do not promise scale before contract.
2. Vague verification: claim-level details, comprehension tests, explicit unknown/stale states, independent trust governance.
3. Stale supply: effective freshness rules, automated degradation, expiry events, partner scorecards, correction queue.
4. Tour economics/privacy: tier capture by need/value, written authority, privacy sweep, chain of custody, utility measurement before 3D.
5. Legal/financial drift: effective-dated rule catalogue, named owners, source monitors, mandatory refresh at action point.
6. AI false confidence: delay broad AI; retrieval/citations only, deterministic tools, bounded intents, escalation, evaluation/audit.
7. Incentive distortion: separate sponsored lanes, compensation disclosure, ranking audit, evidence approval isolated from revenue.
8. Arabic/local mismatch: Dubai-based co-design, reviewed glossary, RTL-native components, parity metrics, cultural/privacy research.
9. Architecture overbuild: modular monolith; event-ready interfaces; extract only proven hotspots.
10. Team/operations overload: curated inventory cap, throughput metrics, automation after method stability, explicit SLA ownership.

## 11. First 10 working days

1. Appoint product/domain, technical, design/research, evidence-operations, and compliance owners.
2. Hold a scope lock: first-time resident buyer, ready-property concierge MVP, 6–8 candidate communities.
3. Open the source-entitlement matrix and start DLD/partner/API conversations.
4. Draft critical claim catalogue and Trust Passport evidence states.
5. Recruit the 30-user research panel and schedule the first 10 sessions.
6. Select 10 tour-pilot units and document capture authority/privacy conditions.
7. Confirm cloud service/residency assumptions and start the DPIA/data-flow map.
8. Review the Superdesign property decision-room draft and approve a visual direction.
9. Establish baseline success thresholds for comprehension, qualified viewing, tour utility, evidence coverage, correction time, and capture cost.
10. Schedule the week-8 go/no-go gate and assign owners to every required artifact.

## 12. Immediate decision backlog

The following choices should be resolved during Phase 0 rather than guessed in implementation:

- Brokerage/referral/advisory operating model and licensing boundary
- Ready ownership only vs limited rental coverage in MVP
- Initial 6–8 communities and inventory-authority partners
- Exact critical-evidence catalogue per property/off-plan type
- DLD/approved source access and display/storage permissions
- Tour capture vendor vs in-house split and export/annotation rights
- Arabic-compatible licensed type pairing
- Maps/routing, identity, communications, analytics, and document-room vendors with UAE residency review
- User-research comprehension and utility thresholds for the Phase 0 gate
- Pilot pricing/revenue model and disclosure presentation

## 13. Design artifacts

- Superdesign project canvas: <https://superdesign.dev/teams/7755dd4e-6852-49be-a354-38ed3b3f6751/projects/468d10da-4d4f-438f-8e97-80fbb840fcad>
- Current property decision-room concept: <https://p.superdesign.dev/draft/d521198d-2033-4874-8a91-6f4a4e2c9c05>
- RAMA design-system source: `.superdesign/design-system.md`

The Superdesign drafts are review artifacts, not approved implementation specifications. The generated concepts established the architectural evidence-board direction and exact RAMA palette, but the Phase 0 prototype must still be refined against the required Trust Passport, cost, tour, bilingual, accessibility, and no-invented-claims acceptance criteria before code implementation.
