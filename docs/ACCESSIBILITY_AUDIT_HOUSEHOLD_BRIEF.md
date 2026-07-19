# Household brief accessibility verification

Verified: 18 July 2026

## Scope

- `/en/brief` at 1440 × 1000
- `/ar/brief` at 390 × 844
- four-step guided brief, consent, readiness and submitted/locked states
- shadcn `Button`, `Input`, `Select`, `Checkbox`, `Card`, `Badge`, `Alert`, `Progress` and `Separator` primitives from preset `b2czZ8JLSS`

## Results

- Axe WCAG 2.0/2.1/2.2 A/AA violations: **0** in English and Arabic test states
- document horizontal overflow: **none** at either viewport
- Arabic container: `dir="rtl"` and `lang="ar"`
- every numeric input has a programmatic label
- select triggers use labelled relationships; checkbox labels include the full visible choice text
- step navigation exposes `aria-current="step"`
- asynchronous validation/save feedback is announced through a live region
- submitted state identifies the lock and disables mutation controls
- skip link and global 3px visible focus indicator remain available
- forced-colors and reduced-motion adaptations are present

## Manual workflow checks

- required processing consent prevents the first save and produces an announced error
- keyboard-operable step buttons expose a logical sequence
- same-origin save produced a server readiness result without exposing bearer, user or role headers in the browser request
- submission updated version `1 → 2`, appended a second audit event and locked editing

Automated results cover the rendered states tested, not every assistive-technology combination. Screen-reader checks with NVDA and VoiceOver remain a release gate.

