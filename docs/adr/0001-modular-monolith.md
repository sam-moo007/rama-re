# ADR 0001 — Modular monolith before service extraction

- Status: accepted for Phase 0 and Phase 1
- Date: 2026-07-17

## Context

RAMA needs explicit domain ownership across catalogue, evidence, decisions, tours, costs, consent and operations. It does not yet have measured scale, independent team ownership, or reliability data that justifies distributed deployment.

## Decision

Use a TypeScript modular monolith in NestJS/Fastify behind one versioned API. Each domain receives a module boundary and uses shared contracts only where a cross-boundary shape is intentional. Asynchronous events are modelled at boundaries but can initially run in-process or through one queue.

## Consequences

- Transactions, audit and claim consistency stay simple during the evidence-method learning phase.
- Deployment and incident response have fewer distributed failure modes.
- A module may be extracted only with evidence of independent scale, ownership, security isolation or reliability requirements.
- Cross-module database access is prohibited; modules use application interfaces even while deployed together.
