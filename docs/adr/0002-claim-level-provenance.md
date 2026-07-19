# ADR 0002 — Claim-level provenance and bitemporal history

- Status: accepted
- Date: 2026-07-17

## Context

A single “verified listing” flag cannot explain who verified a fact, what artifact supports it, when it was true, when RAMA learned it, when it expires, or what changed after a correction.

## Decision

Store each material fact as an independent claim with:

- evidence class and status;
- source and method;
- observed, retrieved, valid-from and valid-to dates;
- recorded and superseded dates;
- confidence and verifier;
- artifact reference and correction history.

Updates create a new version and link to the superseded claim. They never mutate published history. Property-level evidence coverage is computed from required current claims and is always labelled as coverage.

## Consequences

- Customer pages can explain every important fact.
- Stale evidence becomes a first-class visible state.
- Corrections can notify affected decision records without rewriting history.
- Storage and operations are more involved than a flat listing table, but this complexity is the core trust product rather than incidental overhead.
