# App Routes & Pages

## Main Consumer Routes

| URL Route | File Path | Description |
|-----------|-----------|-------------|
| `/[locale]` | `apps/web/src/app/[locale]/page.tsx` | Serene Landing Page & Property Search Hero |
| `/[locale]/homes` | `apps/web/src/app/[locale]/homes/page.tsx` | Verified Property Search & Filter Discovery |
| `/[locale]/homes/[slug]` | `apps/web/src/app/[locale]/homes/[slug]/page.tsx` | Property Decision Room & Evidence Passport |
| `/[locale]/costs` | `apps/web/src/app/[locale]/costs/page.tsx` | Staged Buying Cost Calculator |
| `/[locale]/plan` | `apps/web/src/app/[locale]/plan/page.tsx` | Buying Readiness & Progress Checklist |
| `/[locale]/compare` | `apps/web/src/app/[locale]/compare/page.tsx` | Side-by-Side Property Comparison Matrix |
| `/[locale]/login` | `apps/web/src/app/[locale]/login/page.tsx` | OIDC BFF User Authentication & Login |

## Specialized Operations & Portal Routes

| URL Route | File Path | Description |
|-----------|-----------|-------------|
| `/[locale]/advisor` | `apps/web/src/app/[locale]/advisor/page.tsx` | Advisor Portal & Client Handoff |
| `/[locale]/operations/evidence` | `apps/web/src/app/[locale]/operations/evidence/page.tsx` | Operations Evidence Operations Console |
| `/[locale]/partner` | `apps/web/src/app/[locale]/partner/page.tsx` | Partner Ingestion & Data Provider Hub |
