# ADR 0014: OpenSearch candidate reads and canonical hydration

## Status

Accepted for the Phase 1 production boundary.

## Context

Discovery needs bilingual lexical and geospatial candidate retrieval without making OpenSearch authoritative for property facts, fit explanations or unknown-evidence policy. Deep result sets also need a consistent index snapshot while reconciliation may update documents. An unavailable or drifting index must not trigger an unbounded PostgreSQL scan in production.

## Decision

- Development reads default to the canonical repository. Production reads default to OpenSearch and fail closed with `503 CATALOGUE_SEARCH_UNAVAILABLE`; there is no implicit repository fallback.
- OpenSearch returns only canonical slugs and canonical-record fingerprints. The API batch-hydrates those slugs from PostgreSQL and performs the final evidence-preserving filter, fit calculation, ranking and response serialization on canonical records.
- One candidate retrieval opens a native OpenSearch point-in-time snapshot, traverses it in canonical-slug order with `search_after`, and always attempts to release the PIT. Partial PIT creation is forbidden.
- Candidate traversal is capped by `CATALOGUE_SEARCH_CANDIDATE_CAP` (default 2,000, allowed 100-5,000). Exceeding the cap fails closed rather than silently truncating results. This bounded Phase 1 approach preserves global API-owned fit ranking over the retrieved candidate set.
- Versioned physical indexes are exposed through `OPENSEARCH_CATALOGUE_ALIAS`. The read alias is moved atomically only after the complete canonical generation has indexed and stale-generation cleanup has succeeded.
- Volatile operations telemetry records candidate/hydration counts, PIT pages, duration, missing canonical identities, fingerprint mismatches and duplicate candidates. Staff index status exposes only these aggregate counters, never customer queries.
- The existing HMAC query/brief-bound customer cursor remains the public pagination contract. PIT and `search_after` values stay inside the API and are never accepted from browsers.

## Failure policy

Index errors, malformed candidate hits, PIT creation failure, candidate-cap overflow and alias-promotion failure abort the operation. A cleanup error is reported when it is the primary failure but does not mask an earlier search failure. Canonical PostgreSQL data is never mutated by candidate reads or alias promotion.

## Consequences

OpenSearch can accelerate broad candidate selection while PostgreSQL remains the only source of customer-visible facts. Fingerprint drift becomes observable and stale index-only identities cannot leak into responses. The Phase 1 cap is intentionally not a long-term large-catalogue ranking strategy; a future version must move versioned fit features into a validated ranking projection or introduce a dedicated bounded reranker before the catalogue can exceed the cap.

The live cluster still requires UAE residency review, PIT and alias security permissions, mapping installation, load/failure testing and alert integration. The implementation follows the native [OpenSearch Point in Time API](https://docs.opensearch.org/latest/api-reference/search-apis/point-in-time-api/) and atomic [Manage aliases API](https://docs.opensearch.org/latest/api-reference/alias/aliases-api/).
