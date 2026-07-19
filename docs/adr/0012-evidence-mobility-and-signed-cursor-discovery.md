# ADR 0012: Evidence-labelled mobility and signed cursor discovery

Date: 18 July 2026

Status: Accepted

## Context

The Phase 1 discovery endpoint used offset pagination over an application-ranked list and had no geo or routing evidence contract. Offset links drift when the projection changes, and an unsigned cursor could be altered or replayed against another filter. Travel time is especially risky: present infrastructure, future commitments and modelled scenarios must not be blended, and missing route evidence must not make a property disappear.

## Decision

- Catalogue records carry an optional evidence-labelled geo point and a bounded list of mobility estimates. Every estimate includes destination, mode, infrastructure state, duration/distance (which may be unknown), method/version, source, observed/retrieved dates and assumptions.
- Infrastructure state is explicit: `present`, `committed` or `modelled`. Only present, known-duration evidence can receive match credit. Other states remain review/assumption signals.
- Maximum travel-time and map-bounds filters exclude known contradictions while retaining records whose route or coordinate evidence is unavailable.
- Curated records receive no fabricated geo or travel values. Development fixtures attach coordinates and routes only to records already marked `synthetic_demo`, with visible synthetic source/method labels.
- Search uses an HMAC-SHA256 cursor containing only a version, query/brief fingerprint and last canonical slug. A cursor is valid only for the same filters, sort and brief version. Production requires a shared secret of at least 32 characters.
- Responses expose `hasNextPage` and `nextCursor`; offset pagination is removed. Stable slug tie-breaking makes repeated traversal deterministic for a stable projection.
- PostgreSQL stores the evidence JSON, synchronizes a PostGIS geography point, and adds GiST and JSONB path indexes for the later OpenSearch projection/reconciliation worker.

## Consequences

Customers can filter travel scenarios without converting missing evidence into false absence, and can distinguish present infrastructure from commitments or models. Cursor tampering and cross-query replay fail closed. This is not yet live routing or a production OpenSearch index: vendor selection, UAE residency review, snapshot/PIT semantics and canonical-index reconciliation remain separate deployment increments.
