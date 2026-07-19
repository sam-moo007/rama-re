# ADR 0013: Rebuildable OpenSearch catalogue projection

Date: 18 July 2026

Status: Accepted

## Context

PostgreSQL/PostGIS is canonical, but Phase 1 discovery requires Arabic/English keyword, facet, nested mobility and geospatial indexing. Treating OpenSearch as another source of truth would create correction and deletion drift. A failed partial rebuild must not delete the last complete index generation, and production must not silently fall back to an in-process index.

## Decision

- `CatalogueRepository.listIndexBatch` exports the canonical projection in deterministic canonical-slug batches of at most 500 rows.
- The search-index port has explicit start, batch and finish phases. Every indexed document receives a reconciliation generation and SHA-256 fingerprint of the canonical record.
- OpenSearch mapping is strict. It defines separate Arabic and English analyzers, Arabic normalization/stemming, bilingual keyword subfields, `geo_point` location and nested mobility fields.
- A reconciliation writes every batch first. Stale documents are deleted by generation only after all batches succeed. Any mapping/bulk failure stops before deletion, leaving canonical PostgreSQL and the prior complete index intact.
- The production adapter requires OpenSearch, HTTPS, an API key of at least 20 characters and a validated lowercase index name. Credentials in URLs and in-memory production fallback are forbidden.
- A bounded worker runs at startup and on an interval in production. Development execution is explicit.
- Evidence analysts may read status; only evidence leads may trigger reconciliation. The same-origin operations BFF allowlists exactly those routes and validates mutation origin.
- OpenSearch remains a rebuildable projection. Customer display data continues to come from canonical contracts/records rather than trusting arbitrary index `_source` fields.

## Consequences

The index can be recreated and stale documents reconciled without becoming canonical truth. A partial bulk failure is recoverable on the next generation. This increment builds and operates the projection but does not yet serve customer searches from OpenSearch; candidate retrieval, point-in-time/search-after semantics, index aliases/version migration and durable reconciliation history are the next search-read increment.
