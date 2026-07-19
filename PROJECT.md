# Project: RAMA Real-Estate Platform Phase 1 Completion

## Architecture
- **Monorepo setup**: Turborepo, Next.js (`apps/web`), NestJS (`apps/api`), shared types (`packages/contracts`).
- **Observability**: OpenTelemetry tracing and error logging in both `web` and `api`.
- **UI & Testing**: Storybook for component isolation, Playwright + axe for accessibility checking.

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Observability Integration | OpenTelemetry in apps/api and apps/web for errors/traces | none | PLANNED |
| 2 | Accessibility Automation | Playwright axe accessibility checks integrated into CI/scripts | none | PLANNED |
| 3 | Storybook Setup | Storybook in apps/web hosting tokens/bilingual UI primitives | none | PLANNED |
| 4 | Commute Routing Module | Live routing estimation mapping commute times | none | PLANNED |
| 5 | DLD Transactions UI | Historical DLD comparable transaction tables in decision room UI | none | PLANNED |
| 6 | Panorama Tour Interactions | Lazy-loaded 360-degree panorama viewers with plan-scene sync | none | PLANNED |
| 7 | Final E2E Validation | Pass 100% of the E2E test suite (Tiers 1-5) | M1-M6 | PLANNED |

## Interface Contracts
### apps/api ↔ apps/web
- Endpoints and types as defined in `packages/contracts`.

## Code Layout
- `apps/web/`: Next.js front-end application
- `apps/api/`: NestJS back-end application
- `packages/contracts/`: Shared DTOs and contracts
