# ADR 0006: Versioned household brief and server-owned readiness

Status: accepted  
Date: 18 July 2026

## Context

RAMA needs a customer brief before it can compare properties against household, timing, cash, financing, location and access constraints. These answers are personal decision inputs. They must be explicitly consented, customer-owned, auditable and safe from silent overwrite. A readiness result is useful for planning, but must not become an untraceable browser calculation or be presented as mortgage, legal, tax, valuation or investment advice.

## Decision

- The shared contract accepts structured fields only; it does not accept names, medical narratives or general sensitive free text.
- Required processing consent is part of every valid stored input. Advisor contact and de-identified analytics remain independent optional choices.
- Briefs are scoped to the authenticated customer subject. Cross-customer reads return `404` to avoid confirming record existence.
- Every write includes an expected version. A stale version is rejected instead of overwriting a newer brief.
- Create, update and submit append an actor, reason, version and timestamp to an audit trail.
- Readiness is calculated by the API from versioned assumptions. The web application only renders the returned result.
- Phase 0 readiness uses an explicitly illustrative 7.5% acquisition-cost assumption, an 80% loan-to-value assumption for financed scenarios, and a 25-year/4.5% illustrative payment model.
- Every result carries its assumption version, calculation time and bilingual non-advice disclaimer.
- The browser reaches the customer API through a same-origin, allowlisted BFF. In production, the BFF reads the customer bearer token from an HTTP-only `__Host-` cookie; browser JavaScript cannot read or forward identity headers.
- Submitted briefs are locked in this phase. A later amendment workflow must create an explicit new version or successor rather than mutating submitted history.

## Consequences

- Property-fit services can consume a stable, explainable brief instead of duplicating ad hoc form state.
- Financial assumptions can be refreshed centrally without changing browser code, while historical results retain their assumption version.
- The product must integrate an OIDC login/callback before production customer access.
- Consent withdrawal, retention policy, advisor assignment and submitted-brief amendments remain explicit later workflows.

