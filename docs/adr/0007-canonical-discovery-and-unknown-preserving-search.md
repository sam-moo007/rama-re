# ADR 0007: Canonical discovery and unknown-preserving search

Status: accepted  
Date: 18 July 2026

## Context

RAMA must take a customer from a saved brief into a shortlist without turning missing evidence into a false negative, hiding why a property ranked, or conflating evidence coverage with property quality. The controlled MVP has hundreds—not millions—of curated properties, but its boundary must support a later OpenSearch index without making that index canonical truth.

## Decision

- PostgreSQL remains canonical. Customer search reads a rebuildable `property_catalogue_projection` whose rows retain the canonical property identifier and slug.
- The repository port separates search behavior from the development fixture and PostgreSQL adapters. A later OpenSearch adapter must reconcile identifiers and projection versions back to PostgreSQL.
- Development records that are not sourced inventory are explicitly labelled `synthetic_demo`; they cannot masquerade as curated property claims.
- Search applies the authenticated customer’s latest brief in the API. Browser code never invents or recalculates fit.
- Every result carries inspectable signals classified as hard constraint, preference, unavailable evidence or assumption, with match/review/unknown outcomes.
- An unknown bedroom count remains visible when a minimum-bedroom filter is applied. It receives no match credit and is labelled unavailable, preventing a filter from manufacturing confirmed absence.
- Ranking is deterministic and versioned. Saved-brief fit is ordered before evidence coverage and freshness; without a brief, evidence coverage and freshness are the only ranking inputs.
- Evidence coverage is always accompanied by language stating it is not a quality score.
- Sponsored state is a separate field and must remain visibly separated from organic ranking. All current fixtures are unsponsored.
- Shortlists are customer-owned, limited to canonical slugs, versioned with optimistic concurrency and append exactly one immutable audit event per save.
- Compare accepts 2–4 unique canonical slugs and refreshes fit signals on the server before rendering a differences-first view.
- Customer search, compare and shortlist calls cross the same-origin BFF. Production identity remains in the separate HTTP-only customer cookie.

## Consequences

- Search behavior is explainable and testable before OpenSearch is introduced.
- Unknown evidence can increase review work, but it cannot silently disappear from a customer decision set.
- The PostgreSQL projection needs a reconciliation/rebuild job before production inventory launch.
- Geo/routing facets, Arabic analyzer tuning, pagination cursors and sponsored-lane policy remain later search-adapter work.

