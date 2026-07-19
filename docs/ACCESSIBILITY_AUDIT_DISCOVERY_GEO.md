# Geo and mobility discovery accessibility verification

Verified: 18 July 2026

## Scope

- signed-cursor result pages one and two at `/en/discover?limit=2&sort=price_asc` (1440 x 1000)
- mobility evidence at `/en/discover?destination=difc&travelMode=drive&maxTravelMinutes=20` (1440 x 1000)
- the equivalent Arabic mobility route at 390 x 844
- shadcn `Alert`, `Badge`, `Button`, `Card`, `Input`, `Progress` and `Select` controls from preset `b2czZ8JLSS`

## Results

- axe WCAG 2.0/2.1/2.2 A/AA violations: **0** in all four tested route/viewport states
- document horizontal overflow: **none**
- English routes expose `dir="ltr"`, `lang="en"`; Arabic exposes `dir="rtl"`, `lang="ar"`
- destination, mode, maximum duration and infrastructure state have persistent accessible labels
- travel controls are disabled until a destination is selected
- present/committed/modelled states and unknown route evidence are textual, not color-only
- method, source and observation date accompany each known estimate
- next/previous result controls use locale-correct directional icons and browser history for backward traversal
- two initial contrast defects were detected and corrected before the passing audit

## Evidence and pagination checks

- two API cursor pages and two browser pages returned four unique canonical slugs
- tampered and cross-sort cursors returned `400`
- a map bounding box retained the curated record with unknown coordinates while excluding known out-of-bounds synthetic coordinates
- a 20-minute DIFC filter removed a known 28-minute route but retained the curated record with unavailable route evidence
- no curated record received a synthetic coordinate or mobility estimate
- synthetic route cards visibly say they are demonstration data and not a live route

The repeatable check is `pnpm --filter @rama/web audit:discovery-geo`. Live map keyboard interaction, provider attribution, 200% zoom and production OpenSearch/routing sessions remain later release gates.
