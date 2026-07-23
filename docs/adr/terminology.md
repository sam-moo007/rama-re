# Architectural Decision Record: Nordic Pivot Terminology

## Context
As part of the Nordic Companion Pivot, we are shifting our product tone from a complex "evidence dashboard" to a calm, plain-language "decision companion." A critical component of this pivot is the complete eradication of gamified, technical, or overly-branded terminology that introduces cognitive overhead.

## Decision
We are locking down the following terminology across all codebases, UI elements, CMS structures, and internal communications. 

### Terminology Mapping

| ❌ NEVER USE (Forbidden Term) | ✅ USE INSTEAD (Nordic Vocabulary) | Context / Component |
|-----------------------------|------------------------------------|---------------------|
| **TrustPassport** | **Verification** | Component names, navigation, UI copy |
| **Evidence Coverage Score** / % | **"[X] of [Y] verified"** | Property cards, detail pages |
| **Cost Engine** | **Cost calculator** | Route `/costs`, headings, navigation |
| **Buyer Readiness** | **Buying readiness** | Auth gates, onboarding |
| **Household Brief** | **My requirements** | `/plan` route, user forms |
| **Discover** | **Homes** | Navigation, breadcrumbs |
| **Decision Room** | **Property details** | `/homes/[slug]` page |
| **Evidence freshness** | **Last checked** | Metadata, tooltips |
| **Modelled claim** | **Estimated** | Cost breakdowns, assumptions |
| **Unknown state** | **Not yet confirmed** | Status indicators |

## Enforcement
This vocabulary must be enforced at the PR level. A `grep` check in our CI pipeline will scan for the forbidden terms and block merges if they appear in user-facing strings or component names.

## Consequences
- **Backend**: API responses must be updated to return human-readable statuses instead of evidence ontology keys.
- **Support**: Customer Support must be trained on the new terminology to ensure consistent communication.
- **SEO/Marketing**: All meta descriptions and marketing collateral must be updated to align with the Nordic vocabulary.
